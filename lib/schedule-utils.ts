import { getPrimarySurahForJuzRange } from "./surah-data";

/**
 * A schedule entry from the database
 */
export interface ScheduleEntry {
  id: string;
  date: string | Date;
  ramadanDayNumber: number;
  surahArabic: string;
  surahEnglish: string;
  juzStart: number;       // Planned juz start
  juzEnd: number;         // Planned juz end
  time: string;
  isKhatma: boolean;
  exceptionNote?: string | null;
  actualJuzStart?: number | null;
  actualJuzEnd?: number | null;
  stoppedAtJuz?: number | null;
  completedLastJuz?: boolean | null;
}

/**
 * A schedule entry enriched with dynamically computed actual juz values
 */
export interface DynamicScheduleEntry extends ScheduleEntry {
  dynamicJuzStart: number;  // Computed actual start for display
  dynamicJuzEnd: number;    // Computed actual end for display
  isRecorded: boolean;      // Whether this day has a controller recording
  differsFromPlan: boolean; // Whether the dynamic schedule differs from planned
}

/**
 * The planned pace: 2 juz per day
 */
const PLANNED_JUZZES_PER_DAY = 2;

/**
 * Total number of juz in the Quran
 */
const TOTAL_JUZ = 30;

/**
 * Day number where the second khatma cycle begins
 */
const SECOND_CYCLE_START = 16;

/**
 * Compute the dynamic schedule based on recorded stopping points.
 * 
 * Algorithm:
 * - Iterate through days in order
 * - Track where the next day should start reading (nextJuzStart)
 * - For days with recordings: use the stoppedAtJuz to compute actual end
 * - For days without recordings: project based on planned pace (2 juz/day)
 * - Handle two khatma cycles (day 1-15 and day 16-30)
 * 
 * Stopping rules:
 * - stoppedAtJuz is the last juz that was being read
 * - completedLastJuz = true: they finished that juz, next day starts from stoppedAtJuz + 1
 * - completedLastJuz = false/null: they didn't finish, next day continues from stoppedAtJuz
 * 
 * Display rules:
 * - Only whole integers displayed
 * - dynamicJuzEnd = stoppedAtJuz (integer) 
 * - dynamicJuzStart = computed from previous day's end
 */
export function computeDynamicSchedule(
  schedules: ScheduleEntry[]
): DynamicScheduleEntry[] {
  // Sort by ramadanDayNumber to ensure correct order
  const sorted = [...schedules].sort(
    (a, b) => a.ramadanDayNumber - b.ramadanDayNumber
  );

  const result: DynamicScheduleEntry[] = [];
  let nextJuzStart = 1;
  let hasAnyRecording = false; // Track if we've seen any recording in this cycle

  for (const schedule of sorted) {
    // Check for second cycle reset at day 16
    if (schedule.ramadanDayNumber === SECOND_CYCLE_START) {
      nextJuzStart = 1;
      hasAnyRecording = false;
    }

    const dynamicJuzStart = nextJuzStart;
    let dynamicJuzEnd: number;
    let isRecorded = false;

    if (schedule.stoppedAtJuz != null && schedule.stoppedAtJuz > 0) {
      // Controller recorded where reading stopped
      isRecorded = true;
      hasAnyRecording = true;

      const stoppedAt = schedule.stoppedAtJuz;
      const completedLast = schedule.completedLastJuz ?? true;

      // The end juz to display is the integer juz they were in
      dynamicJuzEnd = Math.floor(stoppedAt);

      // Ensure end is at least as large as start
      if (dynamicJuzEnd < dynamicJuzStart) {
        dynamicJuzEnd = dynamicJuzStart;
      }

      // Compute where next day starts
      if (completedLast) {
        // Fully completed the last juz → next day starts from the next one
        nextJuzStart = dynamicJuzEnd + 1;
      } else {
        // Didn't finish the last juz → next day continues from same juz
        nextJuzStart = dynamicJuzEnd;
      }
    } else {
      // No recording for this day - use planned pace
      dynamicJuzEnd = Math.min(
        dynamicJuzStart + PLANNED_JUZZES_PER_DAY - 1,
        TOTAL_JUZ
      );
      nextJuzStart = dynamicJuzEnd + 1;
    }

    // Clamp values
    if (nextJuzStart > TOTAL_JUZ) {
      nextJuzStart = TOTAL_JUZ;
    }
    if (dynamicJuzEnd > TOTAL_JUZ) {
      dynamicJuzEnd = TOTAL_JUZ;
    }

    // Handle case where we've already finished all juz
    if (dynamicJuzStart > TOTAL_JUZ) {
      // All juz have been scheduled in this cycle
      result.push({
        ...schedule,
        dynamicJuzStart: TOTAL_JUZ,
        dynamicJuzEnd: TOTAL_JUZ,
        isRecorded,
        differsFromPlan:
          TOTAL_JUZ !== schedule.juzStart || TOTAL_JUZ !== schedule.juzEnd,
      });
      continue;
    }

    const differsFromPlan =
      dynamicJuzStart !== schedule.juzStart ||
      dynamicJuzEnd !== schedule.juzEnd;

    result.push({
      ...schedule,
      dynamicJuzStart,
      dynamicJuzEnd,
      isRecorded,
      differsFromPlan,
    });
  }

  return result;
}

/**
 * Get the surah names for a dynamic juz range
 */
export function getSurahInfoForJuzRange(juzStart: number, juzEnd: number): {
  arabic: string;
  english: string;
} {
  return getPrimarySurahForJuzRange(juzStart, juzEnd);
}

/**
 * Determine if a Ramadan day is a khatma day based on dynamic schedule.
 * A khatma occurs when dynamicJuzEnd reaches 30.
 */
export function isDynamicKhatma(entry: DynamicScheduleEntry): boolean {
  return entry.dynamicJuzEnd === TOTAL_JUZ;
}
