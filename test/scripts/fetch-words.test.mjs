// @vitest-environment node
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
  GetObjectCommand: class {
    constructor(options) {
      command(options);
    }
  },
}));

const words = [
  {
    number: 1,
    word: { en: "example", ja: "例" },
    sentences: [{ en: "An example.", ja: "例です。" }],
  },
];
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
    send.mockResolvedValue({
      Body: { transformToString: async () => JSON.stringify(words) },
    });
  });

  afterEach(async () => {
    process.exitCode = previousExitCode;
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  it("downloads the required object and replaces stale data", async () => {
    await writeFile(join(directory, "words.json"), "stale");
    await runScript();

    expect(
      JSON.parse(await readFile(join(directory, "words.json"), "utf8")),
    ).toEqual(words);
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
      access(join(directory, "words.json.download")),
    ).rejects.toThrow();
  });

  it.each([
    "R2_ACCOUNT_ID",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ])("fails before downloading when %s is missing", async (name) => {
    vi.stubEnv(name, "");
    await writeFile(join(directory, "words.json"), "stale");
    await runScript();

    expect(process.exitCode).toBe(1);
    expect(send).not.toHaveBeenCalled();
    await expect(access(join(directory, "words.json"))).rejects.toThrow();
  });

  it.each(["AccessDenied", "NoSuchKey"])(
    "fails without exposing %s request details",
    async (reason) => {
      send.mockRejectedValue(
        new Error(`${reason}: test-secret private-endpoint`),
      );
      await writeFile(join(directory, "words.json"), "stale");
      await runScript();

      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledExactlyOnceWith(
        "Word data preparation failed. Check R2 configuration and data.",
      );
      await expect(access(join(directory, "words.json"))).rejects.toThrow();
      expect(destroy).toHaveBeenCalledOnce();
    },
  );

  it.each([
    "not json",
    "[]",
    "null",
    "{}",
    JSON.stringify([{ ...words[0], number: 0 }]),
    JSON.stringify([{ ...words[0], word: { en: "", ja: "例" } }]),
    JSON.stringify([{ ...words[0], sentences: [{ en: "example" }] }]),
  ])("rejects invalid data (%s)", async (contents) => {
    send.mockResolvedValue({
      Body: { transformToString: async () => contents },
    });
    await runScript();

    expect(process.exitCode).toBe(1);
    await expect(access(join(directory, "words.json"))).rejects.toThrow();
  });

  it("fails when the object has no body", async () => {
    send.mockResolvedValue({});
    await runScript();
    expect(process.exitCode).toBe(1);
  });

  it.each(["request", "body"])(
    "aborts a stalled %s after 30 seconds",
    async (phase) => {
      vi.useFakeTimers();
      const pending = new Promise(() => {});
      send.mockImplementation(() =>
        phase === "request"
          ? pending
          : Promise.resolve({
              Body: { transformToString: () => pending },
            }),
      );
      const execution = runScript();
      await vi.waitFor(() => expect(send).toHaveBeenCalledOnce());
      await vi.advanceTimersByTimeAsync(30_000);
      await execution;

      expect(process.exitCode).toBe(1);
      expect(send.mock.calls[0][1].abortSignal.aborted).toBe(true);
      expect(destroy).toHaveBeenCalledOnce();
      await expect(access(join(directory, "words.json"))).rejects.toThrow();
    },
  );
});
