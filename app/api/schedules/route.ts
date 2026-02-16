import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";

// GET all schedules
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { ramadanDayNumber: "asc" },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST create new schedule
export async function POST(request: NextRequest) {
  try {
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
    } = body;

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        ramadanDayNumber,
        surahArabic,
        surahEnglish,
        juzStart,
        juzEnd,
        time,
        createdById: user.id,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
