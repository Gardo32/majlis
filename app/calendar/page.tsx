import prisma from "@/lib/prisma";
import { CalendarPageContent } from "@/components/CalendarPageContent";

async function getSchedules() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { ramadanDayNumber: "asc" },
  });
  return schedules;
}

export default async function CalendarPage() {
  const schedules = await getSchedules();

  return <CalendarPageContent schedules={schedules} />;
}
