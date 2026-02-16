"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useLanguage } from "@/components/LanguageProvider";

interface MajlisStatus {
  radioStreamUrl: string;
  youtubeVideoId: string | null;
  youtubeLiveUrl: string | null;
  isLive: boolean;
}

export default function MajlisDashboard() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<MajlisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    youtubeVideoId: "",
    radioStreamUrl: "",
    isLive: false,
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setFormData({
          youtubeVideoId: data.youtubeVideoId || "",
          radioStreamUrl: data.radioStreamUrl || "",
          isLive: data.isLive,
        });
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Generate YouTube embed URL if video ID is provided
    let youtubeLiveUrl = null;
    if (formData.youtubeVideoId.trim()) {
      youtubeLiveUrl = `https://www.youtube.com/embed/${formData.youtubeVideoId}`;
    }

    try {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeVideoId: formData.youtubeVideoId || null,
          youtubeLiveUrl,
          radioStreamUrl: formData.radioStreamUrl,
        }),
      });

      if (res.ok) {
        setMessage(t('majlis.settings_updated'));
        fetchStatus();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const toggleLive = async () => {
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: !formData.isLive }),
      });

      if (res.ok) {
        setFormData({ ...formData, isLive: !formData.isLive });
        setMessage(!formData.isLive ? t('majlis.now_live') : t('majlis.now_offline'));
        fetchStatus();
      } else {
        setError(t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  if (loading) {
    return (
      <WindowBox title={t('common.loading')}>
        <div className="text-center py-8">{t('common.loading')}</div>
      </WindowBox>
    );
  }

  return (
    <div className="space-y-4">
      <WindowBox title={t('majlis.title')}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('majlis.desc')}
        </p>
      </WindowBox>

      {message && (
        <div className="win-box bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-3">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="win-box bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-3">
          ⚠️ {error}
        </div>
      )}

      {/* Live Status Toggle */}
      <WindowBox title={t('majlis.live_control')}>
        <div className="space-y-4">
          <div className="flex items-center justify-between win-box p-4">
            <div>
              <div className="font-bold mb-2">{t('majlis.current_status')}</div>
              <LiveIndicator isLive={formData.isLive} />
            </div>

            <button
              onClick={toggleLive}
              className={`win-button text-lg px-8 py-2 ${
                formData.isLive
                  ? "bg-red-200 hover:bg-red-300 dark:bg-red-800"
                  : "bg-green-200 hover:bg-green-300 dark:bg-green-800"
              }`}
            >
              {formData.isLive ? t('majlis.go_offline') : t('majlis.go_live')}
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>{t('radio.note').split(':')[0]}:</strong> {t('majlis.toggle_note')}
            </p>
          </div>
        </div>
      </WindowBox>

      {/* YouTube Live Configuration */}
      <WindowBox title={t('majlis.youtube_config')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">{t('majlis.video_id')}</label>
            <input
              type="text"
              value={formData.youtubeVideoId}
              onChange={(e) =>
                setFormData({ ...formData, youtubeVideoId: e.target.value })
              }
              placeholder="e.g., dQw4w9WgXcQ"
              className="win-input w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('majlis.video_id_hint')}
            </p>
          </div>

          {formData.youtubeVideoId && (
            <div className="win-box bg-blue-50 dark:bg-blue-950 p-3">
              <strong>{t('majlis.preview_url')}</strong>{" "}
              <a 
                href={`https://www.youtube.com/watch?v=${formData.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                https://www.youtube.com/watch?v={formData.youtubeVideoId}
              </a>
            </div>
          )}

          <button type="submit" className="win-button">
            {t('majlis.save_youtube')}
          </button>
        </form>
      </WindowBox>

      {/* Audio-Only Stream (Legacy) */}
      <WindowBox title={t('majlis.audio_config')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">{t('majlis.audio_url')}</label>
            <input
              type="url"
              value={formData.radioStreamUrl}
              onChange={(e) =>
                setFormData({ ...formData, radioStreamUrl: e.target.value })
              }
              placeholder="https://your-icecast-server.com/stream"
              className="win-input w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('majlis.audio_hint')}
            </p>
          </div>

          <button type="submit" className="win-button">
            {t('majlis.save_audio')}
          </button>
        </form>
      </WindowBox>

      {/* Current Settings Display */}
      <WindowBox title={t('majlis.current_settings')}>
        <div className="space-y-2">
          <div className="win-box p-2">
            <strong>{t('majlis.yt_id_label')}</strong>{" "}
            {status?.youtubeVideoId || t('majlis.not_configured')}
          </div>
          <div className="win-box p-2">
            <strong>{t('majlis.audio_label')}</strong>{" "}
            {status?.radioStreamUrl || t('majlis.not_configured')}
          </div>
          <div className="win-box p-2">
            <strong>{t('majlis.live_label')}</strong>{" "}
            {status?.isLive ? "🟢 LIVE" : "⚫ OFFLINE"}
          </div>
        </div>
      </WindowBox>

      {/* YouTube Live Setup Instructions */}
      <WindowBox title={t('majlis.setup_guide')}>
        <div className="space-y-3 text-sm">
          <p className="font-bold">{t('majlis.setup_intro')}</p>

          <div className="win-box p-3">
            <strong>1.</strong> {t('majlis.step1')}{" "}
            <a 
              href="https://studio.youtube.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              YouTube Studio
            </a>
          </div>

          <div className="win-box p-3">
            <strong>2.</strong> {t('majlis.step2')}
          </div>

          <div className="win-box p-3">
            <strong>3.</strong> {t('majlis.step3')}
          </div>

          <div className="win-box p-3">
            <strong>4.</strong> {t('majlis.step4')}
          </div>

          <div className="win-box p-3">
            <strong>5.</strong> {t('majlis.step5')}
          </div>

          <div className="win-box p-3">
            <strong>6.</strong> {t('majlis.step6')}
          </div>

          <div className="mt-4 win-box bg-yellow-50 dark:bg-yellow-950 p-3 text-yellow-800 dark:text-yellow-200">
            <strong>💡</strong> {t('majlis.tip')}
          </div>
        </div>
      </WindowBox>
    </div>
  );
}
