"use client";

import { WindowBox } from "@/components/WindowBox";
import { RadioPlayer } from "@/components/RadioPlayer";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useLanguage } from "@/components/LanguageProvider";

interface MajlisStatus {
    currentSurahArabic: string;
    currentSurahEnglish: string;
    currentJuz: number;
    currentPage: number;
    radioStreamUrl: string | null;
    youtubeVideoId: string | null;
    isLive: boolean;
}

export function RadioPageContent({ status }: { status: MajlisStatus }) {
    const { t, locale } = useLanguage();
    const hasYouTube = status.youtubeVideoId && status.youtubeVideoId.trim() !== "";

    return (
        <div className="space-y-4">
            <WindowBox title={hasYouTube ? `📺 ${t('radio.watch_live')}` : `📻 ${t('radio.title')}`}>
                <div className="text-center space-y-2">
                    <p>
                        {hasYouTube
                            ? t('radio.desc_watch')
                            : t('radio.desc_listen')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {t('radio.note')}
                    </p>
                </div>
            </WindowBox>

            {/* Live Status */}
            <WindowBox title={t('radio.status')}>
                <div className="flex items-center justify-center py-4">
                    <div className="text-center space-y-2">
                        <LiveIndicator isLive={status.isLive} />
                        <div className="text-sm text-muted-foreground">
                            {status.isLive
                                ? t('home.live')
                                : t('home.offline')}
                        </div>
                    </div>
                </div>
            </WindowBox>

            {/* Player */}
            <WindowBox title={hasYouTube ? "📺 YouTube" : `🎵 ${t('radio.player')}`}>
                <div className="space-y-4">
                    <RadioPlayer
                        streamUrl={status.radioStreamUrl || ""}
                        youtubeVideoId={status.youtubeVideoId}
                        isLive={status.isLive}
                    />

                    {status.radioStreamUrl && !hasYouTube && (
                        <div className="text-sm text-muted-foreground border border-border p-2 bg-muted">
                            <strong>{t('radio.stream_url')}:</strong>{" "}
                            <code className="bg-card px-1 border border-border">{status.radioStreamUrl}</code>
                        </div>
                    )}
                </div>
            </WindowBox>

            {/* Currently Reading */}
            {status.isLive && (
                <WindowBox title={t('progress.current_reading')}>
                    <div className="text-center space-y-2">
                        <div className="font-quran-arabic rtl text-3xl">
                            {status.currentSurahArabic}
                        </div>
                        <div className="font-surah-english text-xl">
                            {status.currentSurahEnglish}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {t('home.juz')} {status.currentJuz} - {t('progress.page')} {status.currentPage}
                        </div>
                    </div>
                </WindowBox>
            )}

            {/* Instructions */}
            <WindowBox title={t('radio.instructions')}>
                <div className="space-y-3 text-sm">
                    <div className="border border-border p-3 bg-card text-card-foreground">
                        <strong>1:</strong> {t('radio.step1')}
                    </div>
                    <div className="border border-border p-3 bg-muted text-muted-foreground">
                        <strong>2:</strong> {t('radio.step2')}
                    </div>
                    <div className="border border-border p-3 bg-card text-card-foreground">
                        <strong>3:</strong> {t('radio.step3')}
                    </div>
                    <div className="border border-border p-3 bg-muted text-muted-foreground">
                        <strong>4:</strong> {t('radio.step4')}
                    </div>
                </div>
            </WindowBox>

            {/* Technical Info */}
            <WindowBox title={t('radio.tech_info')}>
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>{t('radio.stream_format')}:</strong> Icecast/MP3 / YouTube
                    </p>
                    <p>
                        <strong>{t('radio.compatibility')}:</strong> {t('radio.compat_desc')}
                    </p>
                </div>
            </WindowBox>
        </div>
    );
}
