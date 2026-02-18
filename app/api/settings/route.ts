import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

// GET /api/settings - Get Ramadan start date (public)
export async function GET() {
  try {
    // Find the first (and ideally only) settings record
    let settings = await prisma.settings.findFirst();

    // If no settings exist, return default
    if (!settings) {
      return NextResponse.json({
        ramadanStartDate: "2026-02-18T00:00:00.000Z",
        isDefault: true,
      });
    }

    return NextResponse.json({
      ramadanStartDate: settings.ramadanStartDate.toISOString(),
      isDefault: false,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update Ramadan start date (ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    // Check if user has ADMIN role
    await requireRole(["ADMIN"]);

    const body = await request.json();
    const { ramadanStartDate } = body;

    // Validate input
    if (!ramadanStartDate) {
      return NextResponse.json(
        { error: "ramadanStartDate is required" },
        { status: 400 }
      );
    }

    const startDate = new Date(ramadanStartDate);
    
    // Validate date is valid
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Optional: Validate date is not too far in the past
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (startDate < oneYearAgo) {
      return NextResponse.json(
        { error: "Ramadan start date cannot be more than 1 year in the past" },
        { status: 400 }
      );
    }

    // Find existing settings
    const existingSettings = await prisma.settings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: { ramadanStartDate: startDate },
      });
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: { ramadanStartDate: startDate },
      });
    }

    return NextResponse.json({
      ramadanStartDate: settings.ramadanStartDate.toISOString(),
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized - Admin role required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
