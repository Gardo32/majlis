import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";
import { uploadToBlob, isConfigured, generateSasUrl } from "@/lib/azure-blob";

// Allow large video uploads
export const maxDuration = 60;

const ALLOWED_UPLOAD_ROLES = ["ADMIN", "MAJLIS"];
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB (videos)

// GET all album images (public) — add ?status=1 to get Drive config status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("status") === "1") {
      return NextResponse.json({ configured: isConfigured() });
    }

    const images = await prisma.albumImage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { name: true },
        },
      },
    });

    // Return SAS-signed URLs so images are accessible regardless of container access level
    const signed = images.map((img) => ({
      ...img,
      blobUrl: generateSasUrl(img.blobName),
    }));

    return NextResponse.json(signed, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Album GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch album images" },
      { status: 500 }
    );
  }
}

// POST — two modes:
//  1. multipart/form-data with "file" field → server proxies small files to Azure (images ≤ 10 MB)
//  2. application/json with { blobName, fileName, mimeType, caption } → register a file already
//     uploaded directly to Azure via the /api/album/sas endpoint (large videos)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || !ALLOWED_UPLOAD_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";

    // --- Path 2: register a pre-uploaded blob ---
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { blobName, fileName, mimeType, caption } = body as {
        blobName: string;
        fileName: string;
        mimeType: string;
        caption?: string;
      };

      if (!blobName || !fileName || !mimeType) {
        return NextResponse.json({ error: "blobName, fileName and mimeType are required" }, { status: 400 });
      }

      // Validate mimeType
      if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
        return NextResponse.json({ error: "Only image and video files are allowed" }, { status: 400 });
      }

      // blobName must start with album/ to prevent abuse
      if (!blobName.startsWith("album/")) {
        return NextResponse.json({ error: "Invalid blobName" }, { status: 400 });
      }

      const image = await prisma.albumImage.create({
        data: {
          blobName,
          blobUrl: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME || "majlis"}/${blobName}`,
          fileName,
          caption: caption || null,
          mimeType,
          uploadedById: user.id,
        },
        include: { uploadedBy: { select: { name: true } } },
      });

      return NextResponse.json(image, { status: 201 });
    }

    // --- Path 1: server-proxied upload (small files / images) ---
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only image and video files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large for server upload. Max: ${MAX_FILE_SIZE / 1024 / 1024} MB. Use direct upload for larger files.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { blobName, url } = await uploadToBlob(buffer, file.name, file.type);

    const image = await prisma.albumImage.create({
      data: {
        blobName,
        blobUrl: url,
        fileName: file.name,
        caption,
        mimeType: file.type,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { name: true } } },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Album POST error:", error);
    return NextResponse.json(
      { error: "Failed to upload" },
      { status: 500 }
    );
  }
}
