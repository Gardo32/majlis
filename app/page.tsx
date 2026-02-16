import prisma from "@/lib/prisma";

async function getSchedules() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const schedules = await prisma.schedule.findMany({
    orderBy: { date: "asc" },
  });

  const todaySchedule = schedules.find((s) => {
    const scheduleDate = new Date(s.date);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate.getTime() === today.getTime();
  });

  const tomorrowSchedule = schedules.find((s) => {
    const scheduleDate = new Date(s.date);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate.getTime() === tomorrow.getTime();
  });

  return { schedules, todaySchedule, tomorrowSchedule };
}

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
        youtubeVideoId: null,
        isLive: false,
      },
    });
  }

  return status;
}

import { HomePageContent } from "@/components/HomePageContent";

export default async function HomePage() {
  const { todaySchedule } = await getSchedules();
  const status = await getMajlisStatus();

  return (
    <HomePageContent
      todaySchedule={todaySchedule ? [todaySchedule] : []}
      status={status}
    />
  );
}
