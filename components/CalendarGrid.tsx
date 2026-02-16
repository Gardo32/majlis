"use client";

import { CalendarDay } from "./CalendarDay";
import { useState } from "react";
import { WindowBox } from "./WindowBox";
import { useLanguage } from "./LanguageProvider";
import { getSurahsInJuzRange, getJuzName } from "@/lib/surah-data";

interface ScheduleItem {
  id: string;
  date: Date;
  ramadanDayNumber: number;
  surahArabic: string;
  surahEnglish: string;
  juzStart: number;
  juzEnd: number;
  time: string;
}

interface CalendarGridProps {
  schedules: ScheduleItem[];
}

export function CalendarGrid({ schedules }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<ScheduleItem | null>(null);
  const { t, locale } = useLanguage();

  // Saturday-first week: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const firstDate = schedules.length > 0 ? new Date(schedules[0].date) : null;
  const jsDay = firstDate ? firstDate.getDay() : 0;
  const satFirstIndex = (jsDay + 1) % 7;
  const emptyCells = Array(satFirstIndex).fill(null);

  const dayKeys = ['days.sat', 'days.sun', 'days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri'];

  return (
    <div className="space-y-4">
      {/* === MOBILE: Vertical scrollable list === */}
      <div className="block md:hidden space-y-1">
        {schedules.map((schedule) => (
          <CalendarDay
            key={schedule.id}
            schedule={schedule}
            onClick={() => setSelectedDay(schedule)}
            listMode
          />
        ))}
      </div>

      {/* === DESKTOP: 7-column grid === */}
      <div className="hidden md:block">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0">
          {dayKeys.map((key) => (
            <div
              key={key}
              className="bg-secondary text-secondary-foreground border-2 border-border p-2 text-center font-bold text-sm"
            >
              {t(key)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="border-2 border-border bg-muted/30 min-h-[120px]"></div>
          ))}
          
          {schedules.map((schedule) => (
            <CalendarDay
              key={schedule.id}
              schedule={schedule}
              onClick={() => setSelectedDay(schedule)}
            />
          ))}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <WindowBox title={`${t('calendar.day_details')} - ${t('home.day')} ${selectedDay.ramadanDayNumber}`}>
          <div className="space-y-4">
            <button
              onClick={() => setSelectedDay(null)}
              className="win-button text-sm"
            >
              {t('common.close')}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-bold mb-1">{t('calendar.date')}:</div>
                <div>{new Date(selectedDay.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</div>
              </div>

              <div>
                <div className="font-bold mb-1">{t('home.ramadan_day')}:</div>
                <div>{t('home.day')} {selectedDay.ramadanDayNumber}</div>
              </div>

              <div>
                <div className="font-bold mb-1">{t('calendar.surah_ar_col')}:</div>
                <div className="font-quran-arabic rtl text-2xl">
                  {selectedDay.surahArabic}
                </div>
              </div>

              <div>
                <div className="font-bold mb-1">{t('calendar.surah_en_col')}:</div>
                <div className="font-surah-english text-xl">
                  {selectedDay.surahEnglish}
                </div>
              </div>

              <div>
                <div className="font-bold mb-1">{t('calendar.juz_range')}:</div>
                <div>
                  {t('home.juz')} {selectedDay.juzStart}
                  {selectedDay.juzStart !== selectedDay.juzEnd
                    ? ` - ${selectedDay.juzEnd}`
                    : ""}
                  {(() => {
                    const jn = getJuzName(selectedDay.juzStart);
                    return jn ? ` (${locale === 'ar' ? jn.arabic : jn.english})` : '';
                  })()}
                </div>
              </div>

              <div>
                <div className="font-bold mb-1">{t('calendar.time')}:</div>
                <div>🕐 {selectedDay.time}</div>
              </div>

              {/* Surahs in this juz range */}
              <div className="col-span-1 sm:col-span-2">
                <div className="font-bold mb-2">{t('home.surah')}:</div>
                <div className="flex flex-wrap gap-2">
                  {getSurahsInJuzRange(selectedDay.juzStart, selectedDay.juzEnd).map((s) => (
                    <span key={s.number} className="text-xs border border-border px-2 py-1 bg-muted">
                      {s.arabic} - {s.english}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </WindowBox>
      )}
    </div>
  );
}
