import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";

// GET majlis status
export async function GET() {
  try {
    let status = await prisma.majlisStatus.findFirst();

    if (!status) {
      status = await prisma.majlisStatus.create({
        data: {
          currentSurahArabic: "الفاتحة",
          currentSurahEnglish: "Al-Fatiha",
          currentJuz: 1,
          currentPage: 1,
          completionPercentage: 0,
          radioStreamUrl: "",
          isLive: false,
        },
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}

// PUT update majlis status
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ADMIN and MAJLIS can update all status fields
    if (
      user.role !== "ADMIN" &&
      user.role !== "MAJLIS"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    let existingStatus = await prisma.majlisStatus.findFirst();

    if (!existingStatus) {
      existingStatus = await prisma.majlisStatus.create({
        data: {
          currentSurahArabic: "الفاتحة",
          currentSurahEnglish: "Al-Fatiha",
          currentJuz: 1,
          currentPage: 1,
          completionPercentage: 0,
          radioStreamUrl: "",
          isLive: false,
        },
      });
    }

    // Determine what fields to update based on role
    const updateData: Record<string, unknown> = {};

    if (user.role === "ADMIN" || user.role === "MAJLIS") {
      if (body.currentSurahArabic !== undefined)
        updateData.currentSurahArabic = body.currentSurahArabic;
      if (body.currentSurahEnglish !== undefined)
        updateData.currentSurahEnglish = body.currentSurahEnglish;
      if (body.currentJuz !== undefined)
        updateData.currentJuz = body.currentJuz;
      if (body.currentPage !== undefined)
        updateData.currentPage = body.currentPage;
      if (body.currentAyah !== undefined)
        updateData.currentAyah = body.currentAyah;
      if (body.completionPercentage !== undefined)
        updateData.completionPercentage = body.completionPercentage;
      if (body.radioStreamUrl !== undefined)
        updateData.radioStreamUrl = body.radioStreamUrl;
      if (body.youtubeVideoId !== undefined)
        updateData.youtubeVideoId = body.youtubeVideoId;
      if (body.youtubeLiveUrl !== undefined)
        updateData.youtubeLiveUrl = body.youtubeLiveUrl;
      if (body.isLive !== undefined) updateData.isLive = body.isLive;
    }

    const status = await prisma.majlisStatus.update({
      where: { id: existingStatus.id },
      data: updateData,
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
