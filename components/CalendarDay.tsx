import { isToday, isPast, isFuture } from "@/lib/date-utils";

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

interface CalendarDayProps {
  schedule: ScheduleItem;
  onClick?: () => void;
}

export function CalendarDay({ schedule, onClick }: CalendarDayProps) {
  const date = new Date(schedule.date);
  const today = isToday(date);
  const past = isPast(date);
  const future = isFuture(date);

  let bgClass = "bg-white";
  if (today) bgClass = "bg-green-200";
  else if (past) bgClass = "bg-gray-100";

  return (
    <div
      onClick={onClick}
      className={`border-2 border-black p-2 min-h-[120px] cursor-pointer hover:bg-green-100 ${bgClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-lg">Day {schedule.ramadanDayNumber}</span>
        {today && (
          <span className="text-xs bg-green-600 text-white px-1">TODAY</span>
        )}
      </div>
      
      <div className="font-quran-arabic rtl text-xl mb-1">
        {schedule.surahArabic}
      </div>
      
      <div className="font-surah-english text-sm mb-1">
        {schedule.surahEnglish}
      </div>
      
      <div className="text-xs text-gray-600">
        Juz {schedule.juzStart}{schedule.juzStart !== schedule.juzEnd ? `-${schedule.juzEnd}` : ""}
      </div>
      
      <div className="text-xs text-gray-600 mt-1">
        🕐 {schedule.time}
      </div>
    </div>
  );
}
