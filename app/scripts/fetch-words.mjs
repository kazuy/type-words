import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const directory = resolve("materials");

async function clearDownloads() {
  await mkdir(directory, { recursive: true });
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (
      entry.isFile() &&
      (entry.name.endsWith(".json") || entry.name.endsWith(".json.download"))
    ) {
      await rm(resolve(directory, entry.name), { force: true });
    }
  }
}

async function prepareWords() {
  await clearDownloads();

  const required = [
    "R2_ACCOUNT_ID",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ];
  if (required.some((name) => !process.env[name]?.trim())) {
    throw new Error("Missing configuration");
  }
  if (!/^[a-f0-9]{32}$/.test(process.env.R2_ACCOUNT_ID)) {
    throw new Error("Invalid account ID");
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    maxAttempts: 3,
  });
  const controller = new AbortController();
  let timeout;

  try {
    const download = async () => {
      const keys = new Set();
      let continuationToken;
      do {
        const page = await client.send(
          new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
            ContinuationToken: continuationToken,
          }),
          { abortSignal: controller.signal },
        );
        for (const { Key: key } of page.Contents ?? []) {
          if (
            key?.endsWith(".json") &&
            !key.includes("/") &&
            !key.includes("\\")
          ) {
            keys.add(key);
          }
        }
        if (
          page.IsTruncated &&
          (!page.NextContinuationToken ||
            page.NextContinuationToken === continuationToken)
        ) {
          throw new Error("Missing or repeated continuation token");
        }
        continuationToken = page.IsTruncated
          ? page.NextContinuationToken
          : undefined;
      } while (continuationToken);
      if (!keys.size) throw new Error("No learning materials");

      for (const key of [...keys].sort()) {
        const response = await client.send(
          new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          }),
          { abortSignal: controller.signal },
        );
        if (!response.Body) throw new Error("Missing body");
        const contents = await response.Body.transformToByteArray();
        if (controller.signal.aborted) throw new Error("Download aborted");
        const destination = resolve(directory, key);
        const temporary = `${destination}.download`;
        await writeFile(temporary, contents, { mode: 0o600 });
        await rename(temporary, destination);
      }
    };
    await Promise.race([
      download(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("Download timed out"));
        }, 30_000);
      }),
    ]);
  } catch (error) {
    await clearDownloads();
    throw error;
  } finally {
    clearTimeout(timeout);
    client.destroy();
  }
}

try {
  await prepareWords();
  console.log("Word data prepared for build.");
} catch {
  console.error(
    "Word data preparation failed. Check R2 configuration and file transfer.",
  );
  process.exitCode = 1;
}
