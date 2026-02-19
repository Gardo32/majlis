import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";
import { deleteFromBlob } from "@/lib/azure-blob";

const ALLOWED_DELETE_ROLES = ["ADMIN", "MAJLIS"];

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user || !ALLOWED_DELETE_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const image = await prisma.albumImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from Azure Blob Storage
    try {
      await deleteFromBlob(image.blobName);
    } catch (blobError) {
      console.error("Blob delete error (continuing):", blobError);
    }

    // Delete from database
    await prisma.albumImage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Album DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
