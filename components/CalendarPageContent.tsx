"use client";

import { WindowBox } from "@/components/WindowBox";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useLanguage } from "@/components/LanguageProvider";

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

export function CalendarPageContent({ schedules }: { schedules: ScheduleItem[] }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <WindowBox title={t('calendar.full_title')}>
                <div className="space-y-4">
                    <div className="border-2 border-border p-3 bg-secondary text-secondary-foreground">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-primary/20 border border-primary"></div>
                                <span>{t('calendar.today')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-muted border border-border"></div>
                                <span>{t('calendar.past')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-card border border-border"></div>
                                <span>{t('calendar.upcoming')}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {t('calendar.legend_desc')}{" "}
                        {t('calendar.full_desc')}
                    </p>
                </div>
            </WindowBox>

            {schedules.length > 0 ? (
                <div className="overflow-x-auto">
                    <CalendarGrid schedules={schedules} />
                </div>
            ) : (
                <WindowBox title={`⚠️ ${t('calendar.no_schedule')}`}>
                    <div className="text-center py-8">
                        <p className="text-lg mb-4">{t('calendar.no_schedule')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('calendar.no_schedule_desc')}
                        </p>
                    </div>
                </WindowBox>
            )}

            {/* Schedule Table View - hidden on mobile since list view above is used */}
            <div className="hidden md:block">
            <WindowBox title={t('calendar.table_view')}>
                {schedules.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="win-table w-full">
                            <thead>
                                <tr>
                                    <th>{t('calendar.day_col')}</th>
                                    <th>{t('calendar.date_col')}</th>
                                    <th>{t('calendar.surah_ar_col')}</th>
                                    <th className="hidden sm:table-cell">{t('calendar.surah_en_col')}</th>
                                    <th>{t('calendar.juz_col')}</th>
                                    <th>{t('calendar.time_col')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((schedule) => {
                                    const isToday = (() => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const scheduleDate = new Date(schedule.date);
                                        scheduleDate.setHours(0, 0, 0, 0);
                                        return scheduleDate.getTime() === today.getTime();
                                    })();

                                    return (
                                        <tr
                                            key={schedule.id}
                                            className={isToday ? "bg-primary/20" : ""}
                                        >
                                            <td className="font-bold whitespace-nowrap">
                                                {t('home.day')} {schedule.ramadanDayNumber}
                                                {isToday && (
                                                    <span className="ms-2 text-xs bg-primary text-primary-foreground px-1">
                                                        {t('calendar.today')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap">{new Date(schedule.date).toLocaleDateString()}</td>
                                            <td className="font-quran-arabic rtl text-lg">
                                                {schedule.surahArabic}
                                            </td>
                                            <td className="font-surah-english hidden sm:table-cell">
                                                {schedule.surahEnglish}
                                            </td>
                                            <td>
                                                {schedule.juzStart}
                                                {schedule.juzStart !== schedule.juzEnd
                                                    ? `-${schedule.juzEnd}`
                                                    : ""}
                                            </td>
                                            <td>{schedule.time}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">
                        {t('calendar.no_schedules_available')}
                    </p>
                )}
            </WindowBox>
            </div>
        </div>
    );
}
