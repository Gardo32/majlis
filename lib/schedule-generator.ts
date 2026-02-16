import { getPrimarySurahForJuzRange } from "./surah-data";

export interface GeneratedSchedule {
  date: Date;
  ramadanDayNumber: number;
  surahArabic: string;
  surahEnglish: string;
  juzStart: number;
  juzEnd: number;
  time: string;
  isKhatma: boolean;
}

/**
 * Generates 30 days of Ramadan schedules with 2 juz per day
 * Days 1-15: Juz 1-30 (completes Quran)
 * Days 16-30: Juz 1-30 (second completion)
 * 
 * @param ramadanStartDate - The first day of Ramadan
 * @param defaultTime - Default time for readings (e.g., "8:00 PM")
 * @returns Array of 30 schedule objects
 */
export function generateRamadanSchedules(
  ramadanStartDate: Date,
  defaultTime: string = "8:00 PM"
): GeneratedSchedule[] {
  const schedules: GeneratedSchedule[] = [];

  for (let day = 1; day <= 30; day++) {
    // Calculate the date for this day
    const scheduleDate = new Date(ramadanStartDate);
    scheduleDate.setDate(ramadanStartDate.getDate() + (day - 1));

    // Calculate juz range: 2 juz per day, wrapping after day 15
    // Day 1: juz 1-2, Day 2: juz 3-4, ..., Day 15: juz 29-30
    // Day 16: juz 1-2 again, Day 17: juz 3-4, ..., Day 30: juz 29-30
    const cycleDay = ((day - 1) % 15) + 1; // Maps day 16->1, 17->2, etc.
    const juzStart = (cycleDay - 1) * 2 + 1;
    const juzEnd = juzStart + 1;

    // Get surah names for this juz range
    const { arabic, english } = getPrimarySurahForJuzRange(juzStart, juzEnd);

    // Mark day 15 and day 30 as Khatma (completion days)
    const isKhatma = day === 15 || day === 30;

    schedules.push({
      date: scheduleDate,
      ramadanDayNumber: day,
      surahArabic: arabic,
      surahEnglish: english,
      juzStart,
      juzEnd,
      time: defaultTime,
      isKhatma,
    });
  }

  return schedules;
}

/**
 * Get schedule for a specific date
 */
export function getScheduleForDate(
  ramadanStartDate: Date,
  targetDate: Date
): GeneratedSchedule | null {
  const schedules = generateRamadanSchedules(ramadanStartDate);
  return schedules.find((s) => isSameDay(s.date, targetDate)) || null;
}

/**
 * Get schedule for a specific Ramadan day number
 */
export function getScheduleForDay(
  ramadanStartDate: Date,
  dayNumber: number
): GeneratedSchedule | null {
  if (dayNumber < 1 || dayNumber > 30) return null;
  const schedules = generateRamadanSchedules(ramadanStartDate);
  return schedules.find((s) => s.ramadanDayNumber === dayNumber) || null;
}

/**
 * Calculate Ramadan day number from a date
 */
export function getRamadanDayNumber(
  ramadanStartDate: Date,
  targetDate: Date
): number | null {
  const start = new Date(ramadanStartDate);
  start.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Day number is 1-indexed
  const dayNumber = diffDays + 1;

  // Must be within 1-30 range
  if (dayNumber < 1 || dayNumber > 30) return null;

  return dayNumber;
}

/**
 * Helper to check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  
  return d1.getTime() === d2.getTime();
}

/**
 * Get all Ramadan dates for the year
 */
export function getRamadanDateRange(ramadanStartDate: Date): {
  start: Date;
  end: Date;
} {
  const start = new Date(ramadanStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(ramadanStartDate);
  end.setDate(start.getDate() + 29); // Day 30 is 29 days after day 1
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Validate if a date falls within Ramadan
 */
export function isDateInRamadan(
  ramadanStartDate: Date,
  targetDate: Date
): boolean {
  const { start, end } = getRamadanDateRange(ramadanStartDate);
  const target = new Date(targetDate);
  
  return target >= start && target <= end;
}
