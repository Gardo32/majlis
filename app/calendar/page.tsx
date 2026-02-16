import prisma from "@/lib/prisma";
import { WindowBox } from "@/components/WindowBox";
import { CalendarGrid } from "@/components/CalendarGrid";

async function getSchedules() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { ramadanDayNumber: "asc" },
  });
  return schedules;
}

export default async function CalendarPage() {
  const schedules = await getSchedules();

  return (
    <div className="space-y-4">
      <WindowBox title="📅 Ramadan Calendar - Full Schedule">
        <div className="space-y-4">
          <div className="border-2 border-border p-3 bg-secondary text-secondary-foreground">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/20 border border-primary"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted border border-border"></div>
                <span>Past Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-card border border-border"></div>
                <span>Upcoming Days</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Click on any day to view detailed information.
            The calendar shows the complete Ramadan Quran reading schedule.
          </p>
        </div>
      </WindowBox>

      {schedules.length > 0 ? (
        <CalendarGrid schedules={schedules} />
      ) : (
        <WindowBox title="⚠️ No Schedule Available">
          <div className="text-center py-8">
            <p className="text-lg mb-4">The Ramadan calendar has not been set up yet.</p>
            <p className="text-sm text-muted-foreground">
              Please check back later or contact the Majlis controller.
            </p>
          </div>
        </WindowBox>
      )}

      {/* Schedule Table View */}
      <WindowBox title="📋 Schedule List View">
        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="win-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Surah (Arabic)</th>
                  <th>Surah (English)</th>
                  <th>Juz</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const isToday = (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const scheduleDate = new Date(schedule.date);
                    scheduleDate.setHours(0, 0, 0, 0);
                    return scheduleDate.getTime() === today.getTime();
                  })();

                  return (
                    <tr
                      key={schedule.id}
                      className={isToday ? "bg-primary/20" : ""}
                    >
                      <td className="font-bold">
                        Day {schedule.ramadanDayNumber}
                        {isToday && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-1">
                            TODAY
                          </span>
                        )}
                      </td>
                      <td>{new Date(schedule.date).toLocaleDateString()}</td>
                      <td className="font-quran-arabic rtl text-lg">
                        {schedule.surahArabic}
                      </td>
                      <td className="font-surah-english">
                        {schedule.surahEnglish}
                      </td>
                      <td>
                        {schedule.juzStart}
                        {schedule.juzStart !== schedule.juzEnd
                          ? `-${schedule.juzEnd}`
                          : ""}
                      </td>
                      <td>{schedule.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No schedules available
          </p>
        )}
      </WindowBox>
    </div>
  );
}
