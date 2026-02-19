import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

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
      name: "Majlis Operator",
      email: "controller@majlis.local",
      emailVerified: true,
      role: "MAJLIS",
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
  console.log("   - controller@majlis.local / controller123 (MAJLIS)");
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
  
  const ramadanStartDate = new Date("2026-02-18T00:00:00.000Z"); // Wednesday, February 18, 2026
  
  await prisma.settings.create({
    data: {
      ramadanStartDate,
    },
  });

  console.log(`✅ Settings created with Ramadan start date: ${ramadanStartDate.toLocaleDateString()}`);

  // Explicit 30-day Ramadan schedule
  // Dates use local-time constructors: new Date(year, month-1, day)
  // 2 juz per day · Days 15 & 30 are Khatma (full completion)
  console.log("📅 Seeding explicit 30-day Ramadan schedule (2 juz/day)...");

  const ramadanDays: {
    day: number;
    date: Date;
    juzStart: number;
    juzEnd: number;
    surahArabic: string;
    surahEnglish: string;
    isKhatma: boolean;
  }[] = [
    // ── Cycle 1: Juz 1-30 ────────────────────────────────────────────
    { day:  1, date: new Date(2026,  1, 18), juzStart:  1, juzEnd:  2, surahArabic: "الفاتحة - البقرة",      surahEnglish: "Al-Fatiha - Al-Baqarah",        isKhatma: false },
    { day:  2, date: new Date(2026,  1, 19), juzStart:  3, juzEnd:  4, surahArabic: "آل عمران - النساء",     surahEnglish: "Ali 'Imran - An-Nisa",           isKhatma: false },
    { day:  3, date: new Date(2026,  1, 20), juzStart:  5, juzEnd:  6, surahArabic: "النساء - المائدة",      surahEnglish: "An-Nisa - Al-Ma'idah",           isKhatma: false },
    { day:  4, date: new Date(2026,  1, 21), juzStart:  7, juzEnd:  8, surahArabic: "الأنعام - الأعراف",     surahEnglish: "Al-An'am - Al-A'raf",            isKhatma: false },
    { day:  5, date: new Date(2026,  1, 22), juzStart:  9, juzEnd: 10, surahArabic: "الأنفال - التوبة",      surahEnglish: "Al-Anfal - At-Tawbah",           isKhatma: false },
    { day:  6, date: new Date(2026,  1, 23), juzStart: 11, juzEnd: 12, surahArabic: "يونس - يوسف",           surahEnglish: "Yunus - Yusuf",                  isKhatma: false },
    { day:  7, date: new Date(2026,  1, 24), juzStart: 13, juzEnd: 14, surahArabic: "الرعد - النحل",         surahEnglish: "Ar-Ra'd - An-Nahl",              isKhatma: false },
    { day:  8, date: new Date(2026,  1, 25), juzStart: 15, juzEnd: 16, surahArabic: "الإسراء - طه",          surahEnglish: "Al-Isra - Ta-Ha",                isKhatma: false },
    { day:  9, date: new Date(2026,  1, 26), juzStart: 17, juzEnd: 18, surahArabic: "الأنبياء - الفرقان",    surahEnglish: "Al-Anbiya - Al-Furqan",          isKhatma: false },
    { day: 10, date: new Date(2026,  1, 27), juzStart: 19, juzEnd: 20, surahArabic: "الشعراء - العنكبوت",   surahEnglish: "Ash-Shu'ara - Al-'Ankabut",      isKhatma: false },
    { day: 11, date: new Date(2026,  1, 28), juzStart: 21, juzEnd: 22, surahArabic: "الروم - يس",            surahEnglish: "Ar-Rum - Ya-Sin",                isKhatma: false },
    { day: 12, date: new Date(2026,  2,  1), juzStart: 23, juzEnd: 24, surahArabic: "الصافات - فصلت",        surahEnglish: "As-Saffat - Fussilat",           isKhatma: false },
    { day: 13, date: new Date(2026,  2,  2), juzStart: 25, juzEnd: 26, surahArabic: "الشورى - الذاريات",     surahEnglish: "Ash-Shura - Adh-Dhariyat",       isKhatma: false },
    { day: 14, date: new Date(2026,  2,  3), juzStart: 27, juzEnd: 28, surahArabic: "الطور - التحريم",       surahEnglish: "At-Tur - At-Tahrim",             isKhatma: false },
    { day: 15, date: new Date(2026,  2,  4), juzStart: 29, juzEnd: 30, surahArabic: "الملك - الناس",         surahEnglish: "Al-Mulk - An-Nas",               isKhatma: true  },
    // ── Cycle 2: Juz 1-30 ────────────────────────────────────────────
    { day: 16, date: new Date(2026,  2,  5), juzStart:  1, juzEnd:  2, surahArabic: "الفاتحة - البقرة",      surahEnglish: "Al-Fatiha - Al-Baqarah",        isKhatma: false },
    { day: 17, date: new Date(2026,  2,  6), juzStart:  3, juzEnd:  4, surahArabic: "آل عمران - النساء",     surahEnglish: "Ali 'Imran - An-Nisa",           isKhatma: false },
    { day: 18, date: new Date(2026,  2,  7), juzStart:  5, juzEnd:  6, surahArabic: "النساء - المائدة",      surahEnglish: "An-Nisa - Al-Ma'idah",           isKhatma: false },
    { day: 19, date: new Date(2026,  2,  8), juzStart:  7, juzEnd:  8, surahArabic: "الأنعام - الأعراف",     surahEnglish: "Al-An'am - Al-A'raf",            isKhatma: false },
    { day: 20, date: new Date(2026,  2,  9), juzStart:  9, juzEnd: 10, surahArabic: "الأنفال - التوبة",      surahEnglish: "Al-Anfal - At-Tawbah",           isKhatma: false },
    { day: 21, date: new Date(2026,  2, 10), juzStart: 11, juzEnd: 12, surahArabic: "يونس - يوسف",           surahEnglish: "Yunus - Yusuf",                  isKhatma: false },
    { day: 22, date: new Date(2026,  2, 11), juzStart: 13, juzEnd: 14, surahArabic: "الرعد - النحل",         surahEnglish: "Ar-Ra'd - An-Nahl",              isKhatma: false },
    { day: 23, date: new Date(2026,  2, 12), juzStart: 15, juzEnd: 16, surahArabic: "الإسراء - طه",          surahEnglish: "Al-Isra - Ta-Ha",                isKhatma: false },
    { day: 24, date: new Date(2026,  2, 13), juzStart: 17, juzEnd: 18, surahArabic: "الأنبياء - الفرقان",    surahEnglish: "Al-Anbiya - Al-Furqan",          isKhatma: false },
    { day: 25, date: new Date(2026,  2, 14), juzStart: 19, juzEnd: 20, surahArabic: "الشعراء - العنكبوت",   surahEnglish: "Ash-Shu'ara - Al-'Ankabut",      isKhatma: false },
    { day: 26, date: new Date(2026,  2, 15), juzStart: 21, juzEnd: 22, surahArabic: "الروم - يس",            surahEnglish: "Ar-Rum - Ya-Sin",                isKhatma: false },
    { day: 27, date: new Date(2026,  2, 16), juzStart: 23, juzEnd: 24, surahArabic: "الصافات - فصلت",        surahEnglish: "As-Saffat - Fussilat",           isKhatma: false },
    { day: 28, date: new Date(2026,  2, 17), juzStart: 25, juzEnd: 26, surahArabic: "الشورى - الذاريات",     surahEnglish: "Ash-Shura - Adh-Dhariyat",       isKhatma: false },
    { day: 29, date: new Date(2026,  2, 18), juzStart: 27, juzEnd: 28, surahArabic: "الطور - التحريم",       surahEnglish: "At-Tur - At-Tahrim",             isKhatma: false },
    { day: 30, date: new Date(2026,  2, 19), juzStart: 29, juzEnd: 30, surahArabic: "الملك - الناس",         surahEnglish: "Al-Mulk - An-Nas",               isKhatma: true  },
  ];

  for (const entry of ramadanDays) {
    await prisma.schedule.create({
      data: {
        date: entry.date,
        ramadanDayNumber: entry.day,
        surahArabic: entry.surahArabic,
        surahEnglish: entry.surahEnglish,
        juzStart: entry.juzStart,
        juzEnd: entry.juzEnd,
        time: "8:00 PM",
        isKhatma: entry.isKhatma,
        createdById: controller.id,
      },
    });
  }

  console.log(`✅ Created 30-day Ramadan schedule`);
  console.log(`   - 2 juz per day (Days 1-15 + Days 16-30)`);
  console.log(`   - Cycle 1: Feb 18 → Mar 4  (Juz 1-30)`);
  console.log(`   - Cycle 2: Mar 5 → Mar 19  (Juz 1-30)`);
  console.log(`   - Days 15 and 30 marked as الختمة (Khatma)`);

  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("📋 Summary:");
  console.log("   - 3 users created");
  console.log("   - 1 Majlis status record created");
  console.log("   - 1 Settings record created");
  console.log("   - 30 schedule entries created (explicit per-day)");
  console.log("");
  console.log("🔐 Login credentials:");
  console.log("   Admin:      admin@majlis.local / admin123");
  console.log("   Controller: controller@majlis.local / controller123");
  console.log("   Majlis:     majlis@majlis.local / majlis123");
  console.log("");
  console.log("📅 Ramadan Configuration:");
  console.log("   Start Date: Wednesday, February 18, 2026");
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
