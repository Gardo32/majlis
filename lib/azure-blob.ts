import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "majlis";

function getCredential() {
  if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY must be set"
    );
  }
  return new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
}

function getContainerClient() {
  const blobService = new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net`,
    getCredential()
  );
  return blobService.getContainerClient(CONTAINER_NAME);
}

/**
 * Programmatically configure CORS on the storage account so the browser
 * can PUT blobs directly to Azure (direct upload). Idempotent — safe to
 * call on every SAS request. Cached per serverless cold-start.
 */
let _corsSetAt = 0;
export async function ensureCorsConfigured(requestOrigin?: string): Promise<void> {
  // Re-apply at most once per hour per cold-start (CORS rules are durable on Azure)
  const now = Date.now();
  if (now - _corsSetAt < 60 * 60 * 1000) return;

  const blobServiceClient = new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net`,
    getCredential()
  );

  // Determine the allowed origin: prefer the exact request origin so
  // the browser receives the matching ACAO header; fall back to wildcard.
  const origin = requestOrigin || "*";

  await blobServiceClient.setProperties({
    cors: [
      {
        // Allow the app origin AND localhost for local dev
        allowedOrigins: origin === "*" ? "*" : `${origin},http://localhost:3000`,
        allowedMethods: "DELETE,GET,HEAD,OPTIONS,PUT",
        allowedHeaders:
          "content-type,x-ms-blob-type,x-ms-version,x-ms-date," +
          "authorization,x-ms-client-request-id,x-ms-content-type",
        exposedHeaders:
          "etag,x-ms-request-id,x-ms-version,x-ms-client-request-id",
        maxAgeInSeconds: 3600,
      },
    ],
  });

  _corsSetAt = now;
}

/**
 * Upload a file to Azure Blob Storage.
 * Returns the blob name (used as the identifier stored in DB).
 */
export async function uploadToBlob(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ blobName: string; url: string }> {
  const container = getContainerClient();

  // Ensure the container exists (public read access for blobs)
  await container.createIfNotExists({ access: "blob" });

  const blobName = `album/${Date.now()}-${fileName}`;
  const blockBlob = container.getBlockBlobClient(blobName);

  await blockBlob.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return { blobName, url: blockBlob.url };
}

/**
 * Delete a blob by name.
 */
export async function deleteFromBlob(blobName: string): Promise<void> {
  const container = getContainerClient();
  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.deleteIfExists();
}

/**
 * Get the public URL for a blob.
 */
export function getBlobUrl(blobName: string): string {
  return `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;
}

/**
 * Generate a write-only SAS URL for direct client upload.
 * The client can PUT bytes straight to Azure, bypassing Vercel's body limit.
 * Expires in 4 hours to accommodate large video uploads.
 */
export function generateUploadSasUrl(blobName: string): string {
  const credential = getCredential();
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + 4 * 60 * 60 * 1000);

  const sasParams = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER_NAME,
      blobName,
      // cw = create + write (allows new blob creation via PUT)
      permissions: BlobSASPermissions.parse("cw"),
      startsOn,
      expiresOn,
      // Note: do NOT set contentType here — it generates an rsct parameter
      // that requires the browser to send the exact same Content-Type,
      // which causes 403s for some video codecs / container formats.
    },
    credential
  );

  return `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${sasParams.toString()}`;
}

/**
 * Generate a SAS URL for a blob (read-only, 24-hour expiry).
 * This ensures images are accessible regardless of container public access settings.
 */
export function generateSasUrl(blobName: string, expiryHours = 24): string {
  const credential = getCredential();
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + expiryHours * 60 * 60 * 1000);

  const sasParams = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER_NAME,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
    },
    credential
  );

  return `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${sasParams.toString()}`;
}

/**
 * Check if Azure Blob Storage is configured.
 */
export function isConfigured(): boolean {
  return !!ACCOUNT_NAME && !!ACCOUNT_KEY;
}
