import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const SURAHS = [
  { number: 1, arabic: "الفاتحة", english: "Al-Fatiha", juz: 1 },
  { number: 2, arabic: "البقرة", english: "Al-Baqarah", juz: 1 },
  { number: 3, arabic: "آل عمران", english: "Ali 'Imran", juz: 3 },
  { number: 4, arabic: "النساء", english: "An-Nisa", juz: 4 },
  { number: 5, arabic: "المائدة", english: "Al-Ma'idah", juz: 6 },
  { number: 6, arabic: "الأنعام", english: "Al-An'am", juz: 7 },
  { number: 7, arabic: "الأعراف", english: "Al-A'raf", juz: 8 },
  { number: 8, arabic: "الأنفال", english: "Al-Anfal", juz: 9 },
  { number: 9, arabic: "التوبة", english: "At-Tawbah", juz: 10 },
  { number: 10, arabic: "يونس", english: "Yunus", juz: 11 },
  { number: 11, arabic: "هود", english: "Hud", juz: 11 },
  { number: 12, arabic: "يوسف", english: "Yusuf", juz: 12 },
  { number: 13, arabic: "الرعد", english: "Ar-Ra'd", juz: 13 },
  { number: 14, arabic: "إبراهيم", english: "Ibrahim", juz: 13 },
  { number: 15, arabic: "الحجر", english: "Al-Hijr", juz: 14 },
  { number: 16, arabic: "النحل", english: "An-Nahl", juz: 14 },
  { number: 17, arabic: "الإسراء", english: "Al-Isra", juz: 15 },
  { number: 18, arabic: "الكهف", english: "Al-Kahf", juz: 15 },
  { number: 19, arabic: "مريم", english: "Maryam", juz: 16 },
  { number: 20, arabic: "طه", english: "Ta-Ha", juz: 16 },
  { number: 21, arabic: "الأنبياء", english: "Al-Anbiya", juz: 17 },
  { number: 22, arabic: "الحج", english: "Al-Hajj", juz: 17 },
  { number: 23, arabic: "المؤمنون", english: "Al-Mu'minun", juz: 18 },
  { number: 24, arabic: "النور", english: "An-Nur", juz: 18 },
  { number: 25, arabic: "الفرقان", english: "Al-Furqan", juz: 18 },
  { number: 26, arabic: "الشعراء", english: "Ash-Shu'ara", juz: 19 },
  { number: 27, arabic: "النمل", english: "An-Naml", juz: 19 },
  { number: 28, arabic: "القصص", english: "Al-Qasas", juz: 20 },
  { number: 29, arabic: "العنكبوت", english: "Al-'Ankabut", juz: 20 },
  { number: 30, arabic: "الروم", english: "Ar-Rum", juz: 21 },
];

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
      completionPercentage: 0,
      radioStreamUrl: "",
      isLive: false,
    },
  });

  // Create sample schedule for 30 days of Ramadan
  // Starting from March 1, 2026 (approximate Ramadan start)
  console.log("📅 Creating sample Ramadan schedule...");

  const ramadanStart = new Date("2026-02-28"); // Approximate Ramadan 1447 start

  for (let day = 1; day <= 30; day++) {
    const date = new Date(ramadanStart);
    date.setDate(ramadanStart.getDate() + day - 1);

    const surahIndex = (day - 1) % SURAHS.length;
    const surah = SURAHS[surahIndex];

    await prisma.schedule.create({
      data: {
        date,
        ramadanDayNumber: day,
        surahArabic: surah.arabic,
        surahEnglish: surah.english,
        juzStart: surah.juz,
        juzEnd: surah.juz,
        time: "20:00",
        createdById: controller.id,
      },
    });
  }

  console.log("✅ Created 30-day Ramadan schedule");

  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("📋 Summary:");
  console.log("   - 3 users created");
  console.log("   - 1 Majlis status record created");
  console.log("   - 30 schedule entries created");
  console.log("");
  console.log("🔐 Login credentials:");
  console.log("   Admin:      admin@majlis.local / admin123");
  console.log("   Controller: controller@majlis.local / controller123");
  console.log("   Majlis:     majlis@majlis.local / majlis123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
