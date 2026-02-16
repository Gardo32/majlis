"use client";

import { WindowBox } from "@/components/WindowBox";
import { ProgressBar } from "@/components/ProgressBar";
import { SurahDisplay } from "@/components/SurahDisplay";
import { useLanguage } from "@/components/LanguageProvider";

interface MajlisStatus {
    currentSurahArabic: string;
    currentSurahEnglish: string;
    currentJuz: number;
    currentPage: number;
    completionPercentage: number;
}

interface ScheduleStats {
    completedDays: number;
    totalDays: number;
    remainingDays: number;
}

interface ProgressPageContentProps {
    status: MajlisStatus;
    stats: ScheduleStats;
}

export function ProgressPageContent({ status, stats }: ProgressPageContentProps) {
    const { t } = useLanguage();

    const juzProgress = ((status.currentJuz - 1) / 30) * 100;
    const pageProgress = ((status.currentPage - 1) / 604) * 100;

    return (
        <div className="space-y-4">
            <WindowBox title={t('progress.title')}>
                <p className="text-center text-muted-foreground">
                    {t('progress.desc')}
                </p>
            </WindowBox>

            {/* Main Progress */}
            <WindowBox title={t('progress.completion_label')}>
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="text-4xl sm:text-6xl font-bold mb-2">
                            {status.completionPercentage.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">{t('progress.complete_status')}</div>
                    </div>

                    <ProgressBar
                        percentage={status.completionPercentage}
                        label={t('progress.completion')}
                    />

                    {status.completionPercentage >= 100 ? (
                        <div className="text-center p-4 bg-primary/20 border-2 border-primary">
                            <div className="text-2xl mb-2">🎉 الحمد لله 🎉</div>
                            <div className="text-lg font-bold">{t('progress.khatm_complete')}</div>
                            <div className="text-sm text-muted-foreground">{t('progress.khatm_dua')}</div>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-secondary text-secondary-foreground border-2 border-border">
                            <div className="text-lg">
                                {(100 - status.completionPercentage).toFixed(1)}% {t('progress.remaining')}
                            </div>
                        </div>
                    )}
                </div>
            </WindowBox>

            {/* Current Reading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WindowBox title={t('progress.current_reading')}>
                    <div className="space-y-4">
                        <div className="border-2 border-border p-4 bg-primary/10 text-center">
                            <SurahDisplay
                                arabic={status.currentSurahArabic}
                                english={status.currentSurahEnglish}
                                size="lg"
                            />
                        </div>
                    </div>
                </WindowBox>

                <WindowBox title={t('progress.current_position')}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-2 border-border p-4 bg-muted text-center">
                                <div className="text-3xl sm:text-4xl font-bold">{status.currentJuz}</div>
                                <div className="text-sm text-muted-foreground">{t('progress.current_juz')}</div>
                            </div>
                            <div className="border-2 border-border p-4 bg-muted text-center">
                                <div className="text-3xl sm:text-4xl font-bold">{status.currentPage}</div>
                                <div className="text-sm text-muted-foreground">{t('progress.current_page')}</div>
                            </div>
                        </div>
                    </div>
                </WindowBox>
            </div>

            {/* Detailed Progress Bars */}
            <WindowBox title={t('progress.detailed')}>
                <div className="space-y-6">
                    <div>
                        <div className="font-bold mb-2">{t('progress.juz_progress')} ({status.currentJuz}/30)</div>
                        <ProgressBar percentage={juzProgress} />
                    </div>

                    <div>
                        <div className="font-bold mb-2">{t('progress.page_progress')} ({status.currentPage}/604)</div>
                        <ProgressBar percentage={pageProgress} />
                    </div>
                </div>
            </WindowBox>

            {/* Schedule Stats */}
            <WindowBox title={t('progress.stats')}>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="border-2 border-border p-2 sm:p-4 bg-muted text-muted-foreground text-center">
                        <div className="text-xl sm:text-3xl font-bold">{stats.completedDays}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{t('progress.days_completed')}</div>
                    </div>
                    <div className="border-2 border-border p-2 sm:p-4 bg-primary/20 text-center">
                        <div className="text-xl sm:text-3xl font-bold">{stats.totalDays}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{t('progress.days_total')}</div>
                    </div>
                    <div className="border-2 border-border p-2 sm:p-4 bg-card text-card-foreground text-center">
                        <div className="text-xl sm:text-3xl font-bold">{stats.remainingDays}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{t('progress.days_remaining')}</div>
                    </div>
                </div>
            </WindowBox>

            {/* Info */}
            <WindowBox title={t('progress.info_title')}>
                <div className="space-y-2 text-sm">
                    <p>{t('progress.info_note')}</p>
                    <p>{t('progress.info_quran')}</p>
                    <p>{t('progress.info_ramadan')}</p>
                </div>
            </WindowBox>
        </div>
    );
}
