import { rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const destination = resolve("words.json");
const temporary = resolve("words.json.download");

async function prepareWords() {
  // Remove stale data so a failed download cannot leave usable build input.
  await rm(destination, { force: true });
  await rm(temporary, { force: true });

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
      const response = await client.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: "words.json",
        }),
        { abortSignal: controller.signal },
      );
      if (!response.Body) throw new Error("Missing body");
      return response.Body.transformToByteArray();
    };
    const contents = await Promise.race([
      download(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("Download timed out"));
        }, 30_000);
      }),
    ]);
    await writeFile(temporary, contents, { mode: 0o600 });
    await rename(temporary, destination);
  } finally {
    clearTimeout(timeout);
    client.destroy();
    await rm(temporary, { force: true });
  }
}

try {
  await prepareWords();
  console.log("Word data prepared for build.");
} catch {
  // SDK errors can contain private endpoint and request details.
  console.error(
    "Word data preparation failed. Check R2 configuration and file transfer.",
  );
  process.exitCode = 1;
}
