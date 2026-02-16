import prisma from "@/lib/prisma";
import { RadioPageContent } from "@/components/RadioPageContent";

async function getMajlisStatus() {
  let status = await prisma.majlisStatus.findFirst();

  if (!status) {
    status = await prisma.majlisStatus.create({
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
  }

  return status;
}

export default async function RadioPage() {
  const status = await getMajlisStatus();

  return <RadioPageContent status={{
    ...status,
    youtubeVideoId: status.youtubeVideoId || null
  }} />;
}
