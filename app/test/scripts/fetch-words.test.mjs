// @vitest-environment node
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send, destroy, configure, command } = vi.hoisted(() => ({
  send: vi.fn(),
  destroy: vi.fn(),
  configure: vi.fn(),
  command: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    constructor(options) {
      configure(options);
    }
    send = send;
    destroy = destroy;
  },
  ListObjectsV2Command: class {
    constructor(options) {
      this.options = options;
      this.kind = "list";
    }
  },
  GetObjectCommand: class {
    constructor(options) {
      command(options);
    }
  },
}));

const fileContents = Buffer.from('{"content":"そのままコピー"}\n');
let directory;
let previousExitCode;

async function runScript() {
  await import("../../scripts/fetch-words.mjs");
}

describe("R2 word data preparation", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    directory = await mkdtemp(join(tmpdir(), "type-words-fetch-"));
    vi.spyOn(process, "cwd").mockReturnValue(directory);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    previousExitCode = process.exitCode;
    process.exitCode = undefined;
    vi.stubEnv("R2_ACCOUNT_ID", "a".repeat(32));
    vi.stubEnv("R2_BUCKET_NAME", "test-private-data");
    vi.stubEnv("R2_ACCESS_KEY_ID", "test-access-key");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "test-secret");
    await mkdir(join(directory, "materials"));
    send.mockImplementation(async (request) =>
      request.kind === "list"
        ? { Contents: [{ Key: "words.json" }] }
        : { Body: { transformToByteArray: async () => fileContents } },
    );
  });

  afterEach(async () => {
    process.exitCode = previousExitCode;
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  it("downloads the required object and replaces stale data", async () => {
    await writeFile(join(directory, "materials", "words.json"), "stale");
    await runScript();

    expect(await readFile(join(directory, "materials", "words.json"))).toEqual(
      fileContents,
    );
    expect(command).toHaveBeenCalledWith({
      Bucket: "test-private-data",
      Key: "words.json",
    });
    expect(configure).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: `https://${"a".repeat(32)}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: "test-access-key",
          secretAccessKey: "test-secret",
        },
      }),
    );
    expect(process.exitCode).toBeUndefined();
    expect(destroy).toHaveBeenCalledOnce();
    await expect(
      access(join(directory, "materials", "words.json.download")),
    ).rejects.toThrow();
  });

  it.each([
    "R2_ACCOUNT_ID",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ])("fails before downloading when %s is missing", async (name) => {
    vi.stubEnv(name, "");
    await writeFile(join(directory, "materials", "words.json"), "stale");
    await runScript();

    expect(process.exitCode).toBe(1);
    expect(send).not.toHaveBeenCalled();
    await expect(
      access(join(directory, "materials", "words.json")),
    ).rejects.toThrow();
  });

  it.each(["AccessDenied", "NoSuchKey"])(
    "fails without exposing %s request details",
    async (reason) => {
      send.mockRejectedValue(
        new Error(`${reason}: test-secret private-endpoint`),
      );
      await writeFile(join(directory, "materials", "words.json"), "stale");
      await runScript();

      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledExactlyOnceWith(
        "Word data preparation failed. Check R2 configuration and file transfer.",
      );
      await expect(
        access(join(directory, "materials", "words.json")),
      ).rejects.toThrow();
      expect(destroy).toHaveBeenCalledOnce();
    },
  );

  it.each([
    { name: "non-JSON text", contents: Buffer.from("not json\n") },
    { name: "an empty JSON array", contents: Buffer.from("[]") },
    { name: "arbitrary JSON", contents: Buffer.from('{"unrelated":true}') },
    { name: "an empty file", contents: Buffer.alloc(0) },
    { name: "binary bytes", contents: Buffer.from([0, 128, 255, 10]) },
  ])(
    "copies $name without parsing or changing the contents",
    async ({ contents }) => {
      send.mockImplementation(async (request) =>
        request.kind === "list"
          ? { Contents: [{ Key: "words.json" }] }
          : { Body: { transformToByteArray: async () => contents } },
      );
      await runScript();

      expect(process.exitCode).toBeUndefined();
      expect(
        await readFile(join(directory, "materials", "words.json")),
      ).toEqual(contents);
    },
  );

  it("fails and cleans up when the destination cannot be replaced", async () => {
    send.mockImplementation(async (request) => {
      if (request.kind === "list") return { Contents: [{ Key: "words.json" }] };
      await mkdir(join(directory, "materials", "words.json"));
      return { Body: { transformToByteArray: async () => fileContents } };
    });
    await runScript();

    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      "Word data preparation failed. Check R2 configuration and file transfer.",
    );
    expect(destroy).toHaveBeenCalledOnce();
    await expect(
      access(join(directory, "materials", "words.json.download")),
    ).rejects.toThrow();
  });

  it("downloads JSON files across listing pages and preserves the example", async () => {
    await writeFile(
      join(directory, "materials", "words.json.example"),
      "example",
    );
    await writeFile(join(directory, "materials", "removed.json"), "stale");
    send.mockImplementation(async (request) => {
      if (request.kind === "list") {
        return request.options.ContinuationToken
          ? { Contents: [{ Key: "words.json" }, { Key: "notes.txt" }] }
          : {
              Contents: [
                { Key: "duo.json" },
                { Key: "nested/hidden.json" },
                { Key: "words.json.example" },
              ],
              IsTruncated: true,
              NextContinuationToken: "next",
            };
      }
      return { Body: { transformToByteArray: async () => fileContents } };
    });
    await runScript();

    expect(command.mock.calls.map(([options]) => options.Key)).toEqual([
      "duo.json",
      "words.json",
    ]);
    expect(send.mock.calls[1][0].options.ContinuationToken).toBe("next");
    expect(await readFile(join(directory, "materials", "duo.json"))).toEqual(
      fileContents,
    );
    expect(
      await readFile(
        join(directory, "materials", "words.json.example"),
        "utf8",
      ),
    ).toBe("example");
    await expect(
      access(join(directory, "materials", "removed.json")),
    ).rejects.toThrow();
  });

  it("removes completed downloads when a later material fails", async () => {
    let downloads = 0;
    send.mockImplementation(async (request) => {
      if (request.kind === "list")
        return { Contents: [{ Key: "duo.json" }, { Key: "words.json" }] };
      if (++downloads === 2) throw new Error("Transfer failed");
      return { Body: { transformToByteArray: async () => fileContents } };
    });
    await runScript();

    expect(process.exitCode).toBe(1);
    await expect(
      access(join(directory, "materials", "duo.json")),
    ).rejects.toThrow();
    await expect(
      access(join(directory, "materials", "words.json")),
    ).rejects.toThrow();
  });

  it.each([
    { Contents: [] },
    { Contents: [{ Key: "nested/words.json" }] },
    { IsTruncated: true },
  ])("fails when listing cannot provide materials: %j", async (page) => {
    send.mockResolvedValue(page);
    await runScript();

    expect(process.exitCode).toBe(1);
    expect(command).not.toHaveBeenCalled();
  });

  it("fails when the object has no body", async () => {
    send.mockImplementation(async (request) =>
      request.kind === "list" ? { Contents: [{ Key: "words.json" }] } : {},
    );
    await runScript();
    expect(process.exitCode).toBe(1);
  });

  it.each(["request", "body"])(
    "aborts a stalled %s after 30 seconds",
    async (phase) => {
      vi.useFakeTimers();
      const pending = new Promise(() => {});
      send.mockImplementation((request) =>
        request.kind === "list"
          ? Promise.resolve({ Contents: [{ Key: "words.json" }] })
          : phase === "request"
            ? pending
            : Promise.resolve({
                Body: { transformToByteArray: () => pending },
              }),
      );
      const execution = runScript();
      await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
      await vi.advanceTimersByTimeAsync(30_000);
      await execution;

      expect(process.exitCode).toBe(1);
      expect(send.mock.calls[0][1].abortSignal.aborted).toBe(true);
      expect(destroy).toHaveBeenCalledOnce();
      await expect(
        access(join(directory, "materials", "words.json")),
      ).rejects.toThrow();
    },
  );
});
