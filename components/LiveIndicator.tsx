"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface LiveIndicatorProps {
  isLive: boolean;
}

export function LiveIndicator({ isLive }: LiveIndicatorProps) {
  const { t } = useLanguage();

  return (
    <div className="live-indicator">
      <div className={`live-dot ${isLive ? "active" : ""}`} />
      <span className="text-sm font-bold">
        {isLive ? t("radio.live_label") : t("radio.offline_label")}
      </span>
    </div>
  );
}
