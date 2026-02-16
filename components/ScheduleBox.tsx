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
            <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 border border-border">
              {new Date(schedule.date).toLocaleDateString()}
            </span>
          </div>

          <SurahDisplay
            arabic={schedule.surahArabic}
            english={schedule.surahEnglish}
            size="md"
          />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="border border-border p-2 bg-muted text-muted-foreground">
              <span className="font-bold text-foreground">Juz:</span>{" "}
              {schedule.juzStart}
              {schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
            </div>
            <div className="border border-border p-2 bg-muted text-muted-foreground">
              <span className="font-bold text-foreground">Time:</span> {schedule.time}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-4">
          No schedule available
        </div>
      )}
    </WindowBox>
  );
}
