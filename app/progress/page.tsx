import prisma from "@/lib/prisma";
import { ProgressPageContent } from "@/components/ProgressPageContent";

async function getMajlisStatus() {
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

  return status;
}

async function getScheduleStats() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { date: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedDays = schedules.filter((s) => {
    const scheduleDate = new Date(s.date);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate < today;
  }).length;

  const totalDays = schedules.length;
  const remainingDays = totalDays - completedDays;

  return { completedDays, totalDays, remainingDays };
}

export default async function ProgressPage() {
  const status = await getMajlisStatus();
  const stats = await getScheduleStats();

  return <ProgressPageContent status={status} stats={stats} />;
}
