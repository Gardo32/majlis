import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "majlis";

function getContainerClient() {
  if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY must be set"
    );
  }
  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
  const blobService = new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net`,
    credential
  );
  return blobService.getContainerClient(CONTAINER_NAME);
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
 * Expires in 2 hours.
 */
export function generateUploadSasUrl(blobName: string, contentType?: string): string {
  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
  const startsOn = new Date();
  // Give large video uploads up to 4 hours to complete
  const expiresOn = new Date(startsOn.getTime() + 4 * 60 * 60 * 1000);

  const sasParams = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER_NAME,
      blobName,
      // cw = create + write (allows new blob creation via PUT)
      permissions: BlobSASPermissions.parse("cw"),
      startsOn,
      expiresOn,
      // Lock the SAS to the expected content-type so Azure enforces it
      contentType: contentType || undefined,
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
  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
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
