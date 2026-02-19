import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { generateUploadSasUrl, isConfigured } from "@/lib/azure-blob";

const ALLOWED_ROLES = ["ADMIN", "MAJLIS"];
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "majlis";
const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;

// GET /api/album/sas?fileName=myvid.mp4&mimeType=video/mp4
// Returns a short-lived write SAS URL so the client can PUT directly to Azure
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isConfigured()) {
      return NextResponse.json({ error: "Azure Blob Storage not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const mimeType = searchParams.get("mimeType") || "application/octet-stream";

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Sanitise filename: strip path components and special chars
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blobName = `album/${Date.now()}-${safeName}`;

    const uploadUrl = generateUploadSasUrl(blobName);

    // The final public (SAS-signed for reading) URL will be generated at GET time.
    // Return the blob name and upload URL to the client.
    return NextResponse.json({
      uploadUrl,       // PUT target with write SAS
      blobName,        // store this; pass back to /api/album to register
      blobBaseUrl: `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`,
      mimeType,
    });
  } catch (error) {
    console.error("SAS generation error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
