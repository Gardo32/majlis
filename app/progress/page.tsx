import prisma from "@/lib/prisma";
import { WindowBox } from "@/components/WindowBox";
import { ProgressBar } from "@/components/ProgressBar";
import { SurahDisplay } from "@/components/SurahDisplay";

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

  // Calculate juz progress
  const juzProgress = ((status.currentJuz - 1) / 30) * 100;
  const pageProgress = ((status.currentPage - 1) / 604) * 100; // Quran has 604 pages

  return (
    <div className="space-y-4">
      <WindowBox title="📊 Quran Majlis Progress Tracker">
        <p className="text-center text-gray-600">
          Track the overall progress of the Ramadan Quran Majlis
        </p>
      </WindowBox>

      {/* Main Progress */}
      <WindowBox title="📈 Overall Quran Completion">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">
              {status.completionPercentage.toFixed(1)}%
            </div>
            <div className="text-muted-foreground">Complete</div>
          </div>

          <ProgressBar
            percentage={status.completionPercentage}
            label="Quran Completion"
          />

          {status.completionPercentage >= 100 ? (
            <div className="text-center p-4 bg-primary/20 border-2 border-primary">
              <div className="text-2xl mb-2">🎉 الحمد لله 🎉</div>
              <div className="text-lg font-bold">Khatm Complete!</div>
              <div className="text-sm text-muted-foreground">
                May Allah accept our recitation
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-secondary text-secondary-foreground border-2 border-border">
              <div className="text-lg">
                {(100 - status.completionPercentage).toFixed(1)}% remaining
              </div>
            </div>
          )}
        </div>
      </WindowBox>

      {/* Current Reading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WindowBox title="📖 Currently Reading">
          <div className="space-y-4">
            <div className="border-2 border-border p-4 bg-primary/10 text-center">
              <SurahDisplay
                arabic={status.currentSurahArabic}
                english={status.currentSurahEnglish}
                size="lg"
              />
            </div>
          </div>
        </WindowBox>

        <WindowBox title="📑 Current Position">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-border p-4 bg-muted text-center">
                <div className="text-4xl font-bold">{status.currentJuz}</div>
                <div className="text-sm text-muted-foreground">Current Juz</div>
              </div>
              <div className="border-2 border-border p-4 bg-muted text-center">
                <div className="text-4xl font-bold">{status.currentPage}</div>
                <div className="text-sm text-muted-foreground">Current Page</div>
              </div>
            </div>
          </div>
        </WindowBox>
      </div>

      {/* Detailed Progress Bars */}
      <WindowBox title="📊 Detailed Progress">
        <div className="space-y-6">
          <div>
            <div className="font-bold mb-2">Juz Progress ({status.currentJuz}/30)</div>
            <ProgressBar percentage={juzProgress} />
          </div>

          <div>
            <div className="font-bold mb-2">Page Progress ({status.currentPage}/604)</div>
            <ProgressBar percentage={pageProgress} />
          </div>
        </div>
      </WindowBox>

      {/* Schedule Stats */}
      <WindowBox title="📅 Schedule Statistics">
        <div className="grid grid-cols-3 gap-4">
          <div className="border-2 border-border p-4 bg-muted text-muted-foreground text-center">
            <div className="text-3xl font-bold">{stats.completedDays}</div>
            <div className="text-sm text-muted-foreground">Days Completed</div>
          </div>
          <div className="border-2 border-border p-4 bg-primary/20 text-center">
            <div className="text-3xl font-bold">{stats.totalDays}</div>
            <div className="text-sm text-muted-foreground">Total Days</div>
          </div>
          <div className="border-2 border-border p-4 bg-card text-card-foreground text-center">
            <div className="text-3xl font-bold">{stats.remainingDays}</div>
            <div className="text-sm text-muted-foreground">Days Remaining</div>
          </div>
        </div>
      </WindowBox>

      {/* Info Box */}
      <WindowBox title="ℹ️ Information">
        <div className="space-y-2 text-sm">
          <p>
            <strong>Note:</strong> The progress is updated by the Majlis controller
            during or after each reading session.
          </p>
          <p>
            The Quran consists of 30 Juz (parts), 114 Surahs (chapters), and
            approximately 604 pages.
          </p>
          <p>
            During Ramadan, the goal is to complete the entire Quran (Khatm)
            over the course of the month.
          </p>
        </div>
      </WindowBox>
    </div>
  );
}
