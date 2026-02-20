import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { generateUploadSasUrl, isConfigured, ensureCorsConfigured } from "@/lib/azure-blob";

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

    // Ensure CORS is configured on the storage account so the browser can PUT
    // directly to Azure. This is idempotent and cached per cold-start.
    const origin = request.headers.get("origin") ?? undefined;
    try {
      await ensureCorsConfigured(origin);
    } catch (corsErr) {
      // Log but don't block — CORS rules may already be set manually
      console.warn("CORS auto-configure failed (continuing):", corsErr);
    }

    // Sanitise filename: strip path components and special chars
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blobName = `album/${Date.now()}-${safeName}`;

    const uploadUrl = generateUploadSasUrl(blobName);

    return NextResponse.json({
      uploadUrl,       // PUT target with write SAS
      blobName,        // pass back to /api/album to register
      blobBaseUrl: `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`,
      mimeType,
    });
  } catch (error) {
    console.error("SAS generation error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
