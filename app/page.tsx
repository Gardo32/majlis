import prisma from "@/lib/prisma";
import { WindowBox } from "@/components/WindowBox";
import { ScheduleBox } from "@/components/ScheduleBox";
import { ProgressBar } from "@/components/ProgressBar";
import { LiveIndicator } from "@/components/LiveIndicator";
import { RadioPlayer } from "@/components/RadioPlayer";
import { SurahDisplay } from "@/components/SurahDisplay";
import Link from "next/link";

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
        isLive: false,
      },
    });
  }
  
  return status;
}

export default async function HomePage() {
  const { schedules, todaySchedule, tomorrowSchedule } = await getSchedules();
  const status = await getMajlisStatus();

  // Get next 5 upcoming schedules
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingSchedules = schedules
    .filter((s) => {
      const scheduleDate = new Date(s.date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today;
    })
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <WindowBox title="🕌 Majlis Haji Ebrahim Aldaqaq - Quran Majlis Tracker">
        <div className="text-center space-y-2">
          <p className="text-lg">Welcome to the Ramadan Quran Majlis Tracking System</p>
          <p className="text-sm text-gray-600">
            View today's scheduled reading, track progress, and follow along with the Majlis
          </p>
        </div>
      </WindowBox>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Schedule - Most Important */}
        <ScheduleBox
          title="📖 Today's Scheduled Reading"
          schedule={todaySchedule || null}
          highlight={true}
        />

        {/* Tomorrow's Schedule */}
        <ScheduleBox
          title="📅 Tomorrow's Reading"
          schedule={tomorrowSchedule || null}
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Majlis Progress */}
        <WindowBox title="📊 Current Majlis Progress">
          <div className="space-y-4">
            <div className="border-2 border-black p-3 bg-green-50">
              <div className="font-bold mb-2">Currently Reading:</div>
              <SurahDisplay
                arabic={status.currentSurahArabic}
                english={status.currentSurahEnglish}
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-black p-2 bg-gray-50">
                <span className="font-bold">Juz:</span> {status.currentJuz}
              </div>
              <div className="border border-black p-2 bg-gray-50">
                <span className="font-bold">Page:</span> {status.currentPage}
              </div>
            </div>
          </div>
        </WindowBox>

        {/* Overall Completion */}
        <WindowBox title="📈 Quran Completion Progress">
          <div className="space-y-4">
            <ProgressBar
              percentage={status.completionPercentage}
              label="Overall Progress"
            />

            <div className="text-sm text-center border border-black p-2 bg-gray-50">
              {status.completionPercentage >= 100
                ? "🎉 Khatm Complete! Alhamdulillah!"
                : `${(100 - status.completionPercentage).toFixed(1)}% remaining`}
            </div>
          </div>
        </WindowBox>
      </div>

      {/* Upcoming Schedule Preview */}
      <WindowBox title="📅 Upcoming Schedule">
        <div className="space-y-2">
          {upcomingSchedules.length > 0 ? (
            <>
              <table className="win-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Surah</th>
                    <th>Juz</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="font-bold">Day {schedule.ramadanDayNumber}</td>
                      <td>{new Date(schedule.date).toLocaleDateString()}</td>
                      <td>
                        <span className="font-quran-arabic rtl">{schedule.surahArabic}</span>
                        {" - "}
                        <span className="font-surah-english">{schedule.surahEnglish}</span>
                      </td>
                      <td>
                        {schedule.juzStart}
                        {schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
                      </td>
                      <td>{schedule.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center mt-4">
                <Link href="/calendar" className="win-button">
                  📅 View Full Calendar
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No schedules available. Please check back later.
            </div>
          )}
        </div>
      </WindowBox>

      {/* Radio Section - Low Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WindowBox title="📡 Live Status">
          <div className="flex items-center justify-center py-2">
            <LiveIndicator isLive={status.isLive} />
          </div>
        </WindowBox>

        <div className="md:col-span-2">
          <WindowBox title="📻 Radio Stream (Optional)">
            <RadioPlayer
              streamUrl={status.radioStreamUrl}
              isLive={status.isLive}
            />
          </WindowBox>
        </div>
      </div>
    </div>
  );
}
