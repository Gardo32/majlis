import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";
import { generateRamadanSchedules } from "@/lib/schedule-generator";

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

// POST create new schedule or regenerate all schedules
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "MAJLIS"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    
    // Check if this is a regenerate request
    if (body.regenerate === true) {
      // Only ADMIN can regenerate
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only admins can regenerate schedules" },
          { status: 403 }
        );
      }

      // Get Ramadan start date from settings
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        // Create default settings
        settings = await prisma.settings.create({
          data: {
            ramadanStartDate: new Date("2026-02-18T00:00:00.000Z"),
          },
        });
      }

      // Delete all existing schedules
      await prisma.schedule.deleteMany({});

      // Generate 30 new schedules
      const generatedSchedules = generateRamadanSchedules(
        settings.ramadanStartDate,
        "8:00 PM"
      );

      // Create all schedules in database
      const schedules = await Promise.all(
        generatedSchedules.map((schedule) =>
          prisma.schedule.create({
            data: {
              date: schedule.date,
              ramadanDayNumber: schedule.ramadanDayNumber,
              surahArabic: schedule.surahArabic,
              surahEnglish: schedule.surahEnglish,
              juzStart: schedule.juzStart,
              juzEnd: schedule.juzEnd,
              time: schedule.time,
              isKhatma: schedule.isKhatma,
              createdById: user.id,
            },
          })
        )
      );

      return NextResponse.json({
        message: "Schedules regenerated successfully",
        count: schedules.length,
        schedules,
      }, { status: 201 });
    }

    // Regular schedule creation
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
        isKhatma: isKhatma || false,
        exceptionNote: exceptionNote || null,
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
