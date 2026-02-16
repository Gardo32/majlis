"use client";

import { CalendarDay } from "./CalendarDay";
import { useState } from "react";
import { WindowBox } from "./WindowBox";

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

  return (
    <div className="space-y-4">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-gray-200 border-2 border-black p-2 text-center font-bold"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {schedules.map((schedule) => (
          <CalendarDay
            key={schedule.id}
            schedule={schedule}
            onClick={() => setSelectedDay(schedule)}
          />
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <WindowBox title={`Day ${selectedDay.ramadanDayNumber} Details`}>
          <div className="space-y-4">
            <button
              onClick={() => setSelectedDay(null)}
              className="win-button text-sm"
            >
              ✕ Close
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold mb-1">Date:</div>
                <div>{new Date(selectedDay.date).toLocaleDateString()}</div>
              </div>

              <div>
                <div className="font-bold mb-1">Ramadan Day:</div>
                <div>Day {selectedDay.ramadanDayNumber}</div>
              </div>

              <div>
                <div className="font-bold mb-1">Surah (Arabic):</div>
                <div className="font-quran-arabic rtl text-2xl">
                  {selectedDay.surahArabic}
                </div>
              </div>

              <div>
                <div className="font-bold mb-1">Surah (English):</div>
                <div className="font-surah-english text-xl">
                  {selectedDay.surahEnglish}
                </div>
              </div>

              <div>
                <div className="font-bold mb-1">Juz Range:</div>
                <div>
                  Juz {selectedDay.juzStart}
                  {selectedDay.juzStart !== selectedDay.juzEnd
                    ? ` - ${selectedDay.juzEnd}`
                    : ""}
                </div>
              </div>

              <div>
                <div className="font-bold mb-1">Time:</div>
                <div>🕐 {selectedDay.time}</div>
              </div>
            </div>
          </div>
        </WindowBox>
      )}
    </div>
  );
}
