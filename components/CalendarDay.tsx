"use client";

import { isToday, isPast, isFuture } from "@/lib/date-utils";
import { getJuzName, getSurahsInJuzRange } from "@/lib/surah-data";
import { useLanguage } from "./LanguageProvider";

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
  /** Render as a horizontal card for mobile list view */
  listMode?: boolean;
}

export function CalendarDay({ schedule, onClick, listMode }: CalendarDayProps) {
  const { t, locale } = useLanguage();
  const date = new Date(schedule.date);
  const today = isToday(date);
  const past = isPast(date);
  
  const juzName = getJuzName(schedule.juzStart);

  let bgClass = "bg-card";
  
  if (schedule.isKhatma) {
    bgClass = "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black dark:from-yellow-500 dark:to-yellow-700";
  } else if (today) {
    bgClass = "bg-primary/20 border-primary";
  } else if (past) {
    bgClass = "bg-muted";
  }

  // Mobile list mode: horizontal card layout
  if (listMode) {
    return (
      <div
        onClick={onClick}
        className={`border-2 border-border p-3 cursor-pointer hover:bg-accent/10 transition-colors relative ${bgClass}`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Day number + date */}
          <div className="flex-shrink-0 text-center min-w-[60px]">
            <div className="font-bold text-lg">{schedule.ramadanDayNumber}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
            </div>
            {today && (
              <span className="text-[10px] bg-primary text-primary-foreground px-1 mt-1 inline-block">
                {t('calendar.today')}
              </span>
            )}
          </div>

          {/* Center: Surah info */}
          <div className="flex-1 min-w-0">
            {(() => {
              const surahs = getSurahsInJuzRange(schedule.juzStart, schedule.juzEnd);
              const displaySurahs = surahs.length > 3
                ? `${surahs[0].arabic} ... ${surahs[surahs.length - 1].arabic}`
                : surahs.map(s => s.arabic).join(" - ");
              return (
                <div className="font-quran-arabic rtl text-lg leading-relaxed truncate">
                  {displaySurahs || schedule.surahArabic}
                </div>
              );
            })()}
            <div className="text-xs text-muted-foreground">
              {t('home.juz')} {schedule.juzStart}{schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
              {juzName && <span className="opacity-75 ms-1">({juzName.arabic})</span>}
            </div>
          </div>

          {/* Right: Time + status */}
          <div className="flex-shrink-0 text-end">
            <div className="text-xs text-muted-foreground">🕐 {schedule.time}</div>
            {schedule.isKhatma && <span className="text-lg">⭐</span>}
            {schedule.exceptionNote && <span className="text-sm">⚠️</span>}
          </div>
        </div>
      </div>
    );
  }

  // Desktop grid mode: compact vertical card
  return (
    <div
      onClick={onClick}
      className={`border-2 border-border p-1.5 sm:p-2 min-h-[80px] sm:min-h-[120px] cursor-pointer hover:bg-accent/10 transition-colors relative ${bgClass}`}
    >
      {/* Status Icons */}
      <div className="absolute top-0.5 end-0.5 flex gap-0.5">
        {schedule.isKhatma && <span className="text-sm sm:text-xl" title="الختمة">⭐</span>}
        {schedule.exceptionNote && <span className="text-sm sm:text-lg" title={schedule.exceptionNote}>⚠️</span>}
      </div>

      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-sm sm:text-lg">
          {schedule.ramadanDayNumber}
        </span>
        {today && (
          <span className="text-[9px] sm:text-xs bg-primary text-primary-foreground px-0.5 sm:px-1">
            {t('calendar.today')}
          </span>
        )}
      </div>

      {(() => {
        const surahs = getSurahsInJuzRange(schedule.juzStart, schedule.juzEnd);
        const displaySurahs = surahs.length > 3
          ? `${surahs[0].arabic}...${surahs[surahs.length - 1].arabic}`
          : surahs.map(s => s.arabic).join(" - ");
        return (
          <div className="font-quran-arabic rtl text-xs sm:text-lg mb-0.5 leading-snug sm:leading-relaxed line-clamp-2">
            {displaySurahs || schedule.surahArabic}
          </div>
        );
      })()}

      <div className="text-[10px] sm:text-xs text-muted-foreground">
        {t('home.juz')} {schedule.juzStart}{schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
        {juzName && (
          <span className="hidden sm:block text-[10px] opacity-75">{juzName.arabic}</span>
        )}
      </div>

      {schedule.actualJuzStart && schedule.actualJuzStart !== schedule.juzStart && (
        <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5">
          {t('calendar.actual')}: {t('home.juz')} {schedule.actualJuzStart}
          {schedule.actualJuzEnd && schedule.actualJuzEnd !== schedule.actualJuzStart
            ? `-${schedule.actualJuzEnd}` : ""}
        </div>
      )}

      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
        🕐 {schedule.time}
      </div>
    </div>
  );
}
