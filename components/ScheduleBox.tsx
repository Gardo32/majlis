import { WindowBox } from "./WindowBox";
import { SurahDisplay } from "./SurahDisplay";

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

interface ScheduleBoxProps {
  title: string;
  schedule: ScheduleItem | null;
  highlight?: boolean;
}

export function ScheduleBox({ title, schedule, highlight = false }: ScheduleBoxProps) {
  return (
    <WindowBox title={title} className={highlight ? "border-green-600 border-4" : ""}>
      {schedule ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold">Day {schedule.ramadanDayNumber}</span>
            <span className="text-sm bg-gray-200 px-2 py-1 border border-black">
              {new Date(schedule.date).toLocaleDateString()}
            </span>
          </div>

          <SurahDisplay
            arabic={schedule.surahArabic}
            english={schedule.surahEnglish}
            size="md"
          />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="border border-black p-2 bg-gray-50">
              <span className="font-bold">Juz:</span>{" "}
              {schedule.juzStart}
              {schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
            </div>
            <div className="border border-black p-2 bg-gray-50">
              <span className="font-bold">Time:</span> {schedule.time}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          No schedule available
        </div>
      )}
    </WindowBox>
  );
}
