import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";

// GET single schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PUT update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "MAJLIS_CONTROLLER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      date,
      ramadanDayNumber,
      surahArabic,
      surahEnglish,
      juzStart,
      juzEnd,
      time,
      isKhatma,
      exceptionNote,
      actualJuzStart,
      actualJuzEnd,
    } = body;

    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (ramadanDayNumber !== undefined) updateData.ramadanDayNumber = ramadanDayNumber;
    if (surahArabic !== undefined) updateData.surahArabic = surahArabic;
    if (surahEnglish !== undefined) updateData.surahEnglish = surahEnglish;
    if (juzStart !== undefined) updateData.juzStart = juzStart;
    if (juzEnd !== undefined) updateData.juzEnd = juzEnd;
    if (time !== undefined) updateData.time = time;
    if (isKhatma !== undefined) updateData.isKhatma = isKhatma;
    if (exceptionNote !== undefined) updateData.exceptionNote = exceptionNote;
    if (actualJuzStart !== undefined) updateData.actualJuzStart = actualJuzStart;
    if (actualJuzEnd !== undefined) updateData.actualJuzEnd = actualJuzEnd;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "MAJLIS_CONTROLLER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Schedule deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
