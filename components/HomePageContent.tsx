"use client";

import Link from "next/link";
import { WindowBox } from "@/components/WindowBox";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useLanguage } from "@/components/LanguageProvider";

interface MajlisStatus {
    currentSurahArabic: string;
    currentSurahEnglish: string;
    currentJuz: number;
    currentPage: number;
    completionPercentage: number;
    radioStreamUrl: string | null;
    youtubeVideoId: string | null;
    isLive: boolean;
}

interface HomePageContentProps {
    todaySchedule: any[];
    status: MajlisStatus;
}

export function HomePageContent({ todaySchedule, status }: HomePageContentProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            {/* Welcome Box */}
            <WindowBox title={t('app.title')}>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold">
                        {t('home.welcome')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t('home.subtitle')}
                    </p>
                </div>
            </WindowBox>

            {/* Live Status + Radio Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WindowBox title={t('home.live_status')}>
                    <div className="flex flex-col items-center justify-center space-y-3 py-2">
                        <LiveIndicator isLive={status.isLive} />
                        <div className="text-center">
                            {status.isLive ? (
                                <span className="text-red-600 font-bold animate-pulse">
                                    {t('home.live')}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">
                                    {t('home.offline')}
                                </span>
                            )}
                        </div>
                    </div>
                </WindowBox>

                <div className="md:col-span-2">
                    <WindowBox title={`📻 ${t('home.listen_live')}`}>
                        <div className="text-center space-y-4 py-4">
                            <p className="text-muted-foreground">
                                {t('home.listen_live_desc')}
                            </p>
                            <Link href="/radio" className="win-button inline-block">
                                🎧 {t('home.go_radio')}
                            </Link>
                        </div>
                    </WindowBox>
                </div>
            </div>

            {/* Calendar Link */}
            <div className="text-center">
                <Link href="/calendar" className="win-button inline-block">
                    📅 {t('home.view_schedule')}
                </Link>
            </div>
        </div>
    );
}
