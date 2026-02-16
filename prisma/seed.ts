import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { generateRamadanSchedules } from "../lib/schedule-generator";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create default users with hashed passwords
  const adminPassword = await hashPassword("admin123");
  const controllerPassword = await hashPassword("controller123");
  const majlisPassword = await hashPassword("majlis123");

  // Delete existing data
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.majlisStatus.deleteMany({});
  await prisma.settings.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👤 Creating users...");

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@majlis.local",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  // Create credential account for admin
  await prisma.account.create({
    data: {
      accountId: admin.id,
      providerId: "credential",
      userId: admin.id,
      password: adminPassword,
    },
  });

  const controller = await prisma.user.create({
    data: {
      name: "Majlis Controller",
      email: "controller@majlis.local",
      emailVerified: true,
      role: "MAJLIS_CONTROLLER",
    },
  });

  await prisma.account.create({
    data: {
      accountId: controller.id,
      providerId: "credential",
      userId: controller.id,
      password: controllerPassword,
    },
  });

  const majlis = await prisma.user.create({
    data: {
      name: "Majlis Operator",
      email: "majlis@majlis.local",
      emailVerified: true,
      role: "MAJLIS",
    },
  });

  await prisma.account.create({
    data: {
      accountId: majlis.id,
      providerId: "credential",
      userId: majlis.id,
      password: majlisPassword,
    },
  });

  console.log("✅ Users created:");
  console.log("   - admin@majlis.local / admin123 (ADMIN)");
  console.log("   - controller@majlis.local / controller123 (MAJLIS_CONTROLLER)");
  console.log("   - majlis@majlis.local / majlis123 (MAJLIS)");

  // Create initial Majlis status
  console.log("📊 Creating initial Majlis status...");

  await prisma.majlisStatus.create({
    data: {
      currentSurahArabic: "الفاتحة",
      currentSurahEnglish: "Al-Fatiha",
      currentJuz: 1,
      currentPage: 1,
      currentAyah: 1,
      completionPercentage: 0,
      radioStreamUrl: "",
      isLive: false,
    },
  });

  // Create Settings with Ramadan start date
  console.log("⚙️ Creating settings...");
  
  const ramadanStartDate = new Date("2026-02-19T00:00:00.000Z"); // Thursday, February 19, 2026
  
  await prisma.settings.create({
    data: {
      ramadanStartDate,
    },
  });

  console.log(`✅ Settings created with Ramadan start date: ${ramadanStartDate.toLocaleDateString()}`);

  // Generate automatic 30-day Ramadan schedule (2 juz per day)
  console.log("📅 Generating automatic 30-day Ramadan schedule (2 juz/day)...");

  const schedules = generateRamadanSchedules(ramadanStartDate, "8:00 PM");

  for (const schedule of schedules) {
    await prisma.schedule.create({
      data: {
        date: schedule.date,
        ramadanDayNumber: schedule.ramadanDayNumber,
        surahArabic: schedule.surahArabic,
        surahEnglish: schedule.surahEnglish,
        juzStart: schedule.juzStart,
        juzEnd: schedule.juzEnd,
        time: schedule.time,
        isKhatma: schedule.isKhatma,
        createdById: controller.id,
      },
    });
  }

  console.log(`✅ Created 30-day Ramadan schedule`);
  console.log(`   - 2 juz per day (automatic progression)`);
  console.log(`   - First completion on Day 15 (Juz 29-30)`);
  console.log(`   - Second cycle starts Day 16 (Juz 1-2)`);
  console.log(`   - Days 15 and 30 marked as الختمة (Khatma)`);

  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("📋 Summary:");
  console.log("   - 3 users created");
  console.log("   - 1 Majlis status record created");
  console.log("   - 1 Settings record created");
  console.log("   - 30 schedule entries created (auto-generated)");
  console.log("");
  console.log("🔐 Login credentials:");
  console.log("   Admin:      admin@majlis.local / admin123");
  console.log("   Controller: controller@majlis.local / controller123");
  console.log("   Majlis:     majlis@majlis.local / majlis123");
  console.log("");
  console.log("📅 Ramadan Configuration:");
  console.log("   Start Date: Thursday, February 19, 2026");
  console.log("   Schedule:   2 juz per day (completes twice in 30 days)");
  console.log("   Khatma:     Days 15 and 30");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
