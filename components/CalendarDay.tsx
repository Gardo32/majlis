import { isToday, isPast, isFuture } from "@/lib/date-utils";
import { getJuzName } from "@/lib/surah-data";

interface ScheduleItem {
  id: string;
  date: Date;
  ramadanDayNumber: number;
  surahArabic: string;
  surahEnglish: string;
  juzStart: number;
  juzEnd: number;
  time: string;
  isKhatma?: boolean;
  exceptionNote?: string | null;
  actualJuzStart?: number | null;
  actualJuzEnd?: number | null;
}

interface CalendarDayProps {
  schedule: ScheduleItem;
  onClick?: () => void;
}

export function CalendarDay({ schedule, onClick }: CalendarDayProps) {
  const date = new Date(schedule.date);
  const today = isToday(date);
  const past = isPast(date);
  const future = isFuture(date);
  
  const juzName = getJuzName(schedule.juzStart);

  let bgClass = "bg-card";
  
  // Khatma day gets gold gradient
  if (schedule.isKhatma) {
    bgClass = "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black dark:from-yellow-500 dark:to-yellow-700";
  } else if (today) {
    bgClass = "bg-primary/20 border-primary";
  } else if (past) {
    bgClass = "bg-muted";
  }

  return (
    <div
      onClick={onClick}
      className={`border-2 border-border p-2 min-h-[120px] cursor-pointer hover:bg-accent/10 transition-colors relative ${bgClass}`}
    >
      {/* Status Icons */}
      <div className="absolute top-1 right-1 flex gap-1">
        {schedule.isKhatma && (
          <span className="text-xl" title="الختمة - Completion">⭐</span>
        )}
        {schedule.exceptionNote && (
          <span className="text-lg" title={`Exception: ${schedule.exceptionNote}`}>⚠️</span>
        )}
      </div>

      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-lg">Day {schedule.ramadanDayNumber}</span>
        {today && (
          <span className="text-xs bg-primary text-primary-foreground px-1">TODAY</span>
        )}
      </div>

      <div className="font-quran-arabic rtl text-xl mb-1">
        {schedule.surahArabic}
      </div>

      <div className="font-surah-english text-sm mb-1">
        {schedule.surahEnglish}
      </div>

      <div className="text-xs text-muted-foreground">
        Juz {schedule.juzStart}{schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
        {juzName && (
          <span className="block text-xs opacity-75">{juzName.english}</span>
        )}
      </div>

      {schedule.actualJuzStart && schedule.actualJuzStart !== schedule.juzStart && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Actual: Juz {schedule.actualJuzStart}
          {schedule.actualJuzEnd && schedule.actualJuzEnd !== schedule.actualJuzStart
            ? `-${schedule.actualJuzEnd}`
            : ""}
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-1">
        🕐 {schedule.time}
      </div>
    </div>
  );
}
