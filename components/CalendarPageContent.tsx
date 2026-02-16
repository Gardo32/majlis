"use client";

import { WindowBox } from "@/components/WindowBox";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useLanguage } from "@/components/LanguageProvider";
import { computeDynamicSchedule, type ScheduleEntry } from "@/lib/schedule-utils";

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
    stoppedAtJuz?: number | null;
    completedLastJuz?: boolean | null;
}

export function CalendarPageContent({ schedules }: { schedules: ScheduleItem[] }) {
    const { t } = useLanguage();

    // Compute the dynamic schedule based on recorded stopping points
    const dynamicSchedules = computeDynamicSchedule(schedules as ScheduleEntry[]);

    // Check if any days have recordings
    const hasRecordings = dynamicSchedules.some(d => d.isRecorded);
    const hasAdjustments = dynamicSchedules.some(d => d.differsFromPlan);

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
                            {hasRecordings && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-50 dark:bg-green-950 border border-green-500"></div>
                                    <span>✅ {t('calendar.recorded')}</span>
                                </div>
                            )}
                            {hasAdjustments && (
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 text-xs">↻</span>
                                    <span>{t('calendar.adjusted')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {t('calendar.legend_desc')}{" "}
                        {t('calendar.dynamic_desc')}
                    </p>
                </div>
            </WindowBox>

            {dynamicSchedules.length > 0 ? (
                <div className="overflow-x-auto">
                    <CalendarGrid schedules={dynamicSchedules} />
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

            {/* Table View - desktop only */}
            <div className="hidden md:block">
                <WindowBox title={t('calendar.table_view')}>
                    {dynamicSchedules.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="win-table w-full">
                                <thead>
                                    <tr>
                                        <th>{t('calendar.day_col')}</th>
                                        <th>{t('calendar.date_col')}</th>
                                        <th>{t('calendar.planned_juz')}</th>
                                        <th>{t('calendar.actual_juz')}</th>
                                        <th className="hidden sm:table-cell">{t('calendar.surah_ar_col')}</th>
                                        <th>{t('calendar.time_col')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dynamicSchedules.map((schedule) => {
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
                                                className={`${isToday ? "bg-primary/20" : ""} ${schedule.isRecorded ? "bg-green-50 dark:bg-green-950" : ""}`}
                                            >
                                                <td className="font-bold whitespace-nowrap">
                                                    {t('home.day')} {schedule.ramadanDayNumber}
                                                    {isToday && (
                                                        <span className="ms-2 text-xs bg-primary text-primary-foreground px-1">
                                                            {t('calendar.today')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {new Date(schedule.date).toLocaleDateString(
                                                        'en-US',
                                                        { month: 'short', day: 'numeric' }
                                                    )}
                                                </td>
                                                <td className="text-muted-foreground">
                                                    {schedule.juzStart}-{schedule.juzEnd}
                                                </td>
                                                <td className={schedule.differsFromPlan ? "font-bold text-blue-600 dark:text-blue-400" : ""}>
                                                    {schedule.dynamicJuzStart}-{schedule.dynamicJuzEnd}
                                                    {schedule.isRecorded && <span className="ms-1">✅</span>}
                                                    {schedule.differsFromPlan && !schedule.isRecorded && (
                                                        <span className="ms-1 text-blue-500">↻</span>
                                                    )}
                                                </td>
                                                <td className="font-quran-arabic rtl text-lg hidden sm:table-cell">
                                                    {schedule.surahArabic}
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
