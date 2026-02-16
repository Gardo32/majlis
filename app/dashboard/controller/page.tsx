"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { getJuzName, SURAHS } from "@/lib/surah-data";
import { useLanguage } from "@/components/LanguageProvider";

interface Schedule {
  id: string;
  date: string;
  ramadanDayNumber: number;
  surahArabic: string;
  surahEnglish: string;
  juzStart: number;
  juzEnd: number;
  time: string;
  isKhatma: boolean;
  exceptionNote: string | null;
  actualJuzStart: number | null;
  actualJuzEnd: number | null;
}

interface MajlisStatus {
  currentJuz: number;
  currentAyah: number;
  currentSurahArabic: string;
  currentSurahEnglish: string;
}

export default function ControllerDashboard() {
  const { t, locale } = useLanguage();
  const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [status, setStatus] = useState<MajlisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Progress form
  const [progressForm, setProgressForm] = useState({
    stoppedAtSurah: 1,
    stoppedAtJuz: 1,
    stoppedAtAyah: 1,
  });

  // Get surahs that are in the selected juz
  const surahsInSelectedJuz = SURAHS.filter(s => s.juz === progressForm.stoppedAtJuz);

  // Exception form
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionNote, setExceptionNote] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, statusRes] = await Promise.all([
        fetch("/api/schedules"),
        fetch("/api/status"),
      ]);

      if (schedulesRes.ok) {
        const schedules = await schedulesRes.json();
        setAllSchedules(schedules);

        // Find today's schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];
        
        const todayScheduleItem = schedules.find((s: Schedule) => {
          const scheduleDate = new Date(s.date);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate.toISOString().split("T")[0] === todayStr;
        });

        setTodaySchedule(todayScheduleItem || null);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatus(data);
        const currentSurah = SURAHS.find(s => s.english === data.currentSurahEnglish);
        setProgressForm({
          stoppedAtSurah: currentSurah?.number || 1,
          stoppedAtJuz: data.currentJuz || 1,
          stoppedAtAyah: data.currentAyah || 1,
        });
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const surah = SURAHS.find(s => s.number === progressForm.stoppedAtSurah);
    if (!surah) {
      setError("Invalid surah selected");
      return;
    }

    try {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSurahArabic: surah.arabic,
          currentSurahEnglish: surah.english,
          currentJuz: progressForm.stoppedAtJuz,
          currentAyah: progressForm.stoppedAtAyah,
        }),
      });

      if (res.ok) {
        setMessage(t('ctrl.progress_saved'));
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleKhatma = async () => {
    if (!todaySchedule) return;
    
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/schedules/${todaySchedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isKhatma: !todaySchedule.isKhatma,
        }),
      });

      if (res.ok) {
        setMessage(`${todaySchedule.isKhatma ? t('ctrl.unmarked_khatma') : t('ctrl.marked_khatma')}`);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleKhatmaForDay = async (scheduleId: string, currentIsKhatma: boolean) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isKhatma: !currentIsKhatma,
        }),
      });

      if (res.ok) {
        setMessage(`${currentIsKhatma ? t('ctrl.unmarked_khatma') : t('ctrl.marked_khatma')}`);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleSaveException = async () => {
    if (!todaySchedule) return;
    
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/schedules/${todaySchedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exceptionNote: exceptionNote || null,
        }),
      });

      if (res.ok) {
        setMessage(t('ctrl.exception_saved'));
        setShowExceptionModal(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
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
      <WindowBox title={t('ctrl.title')}>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('ctrl.desc')}
        </p>

        {message && (
          <div className="win-box bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-2 mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="win-box bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-2 mb-4">
            {error}
          </div>
        )}
      </WindowBox>

      {/* Today's Schedule */}
      <WindowBox title={t('ctrl.today')}>
        {todaySchedule ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold">{t('ctrl.ramadan_day')}:</span> {todaySchedule.ramadanDayNumber}
              </div>
              <div>
                <span className="font-bold">{t('ctrl.date')}:</span>{" "}
                {new Date(todaySchedule.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div>
                <span className="font-bold">{t('ctrl.expected_juz')}:</span> {todaySchedule.juzStart}-{todaySchedule.juzEnd}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getJuzName(todaySchedule.juzStart)?.english} - {getJuzName(todaySchedule.juzEnd)?.english}
                </div>
              </div>
              <div>
                <span className="font-bold">{t('ctrl.time')}:</span> {todaySchedule.time}
              </div>
              <div className="col-span-2">
                <span className="font-bold">{t('ctrl.surahs')}:</span>{" "}
                <span className="font-quran-arabic text-xl">{todaySchedule.surahArabic}</span>
                <br />
                <span className="text-sm">{todaySchedule.surahEnglish}</span>
              </div>
            </div>

            {todaySchedule.isKhatma && (
              <div className="win-box bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-3">
                <span className="text-2xl">⭐</span> <strong>الختمة</strong> - {t('ctrl.khatma_day')}
              </div>
            )}

            {todaySchedule.exceptionNote && (
              <div className="win-box bg-orange-100 dark:bg-orange-900 p-3">
                <strong>⚠️ {t('ctrl.exception')}:</strong> {todaySchedule.exceptionNote}
              </div>
            )}

            {todaySchedule.actualJuzStart && (
              <div className="win-box bg-blue-100 dark:bg-blue-900 p-3">
                <strong>{t('ctrl.actual_progress')}:</strong> {t('ctrl.juz')} {todaySchedule.actualJuzStart}
                {todaySchedule.actualJuzEnd && todaySchedule.actualJuzEnd !== todaySchedule.actualJuzStart
                  ? `-${todaySchedule.actualJuzEnd}`
                  : ""}
              </div>
            )}

            {status && (status.currentSurahEnglish !== "Al-Fatiha" || status.currentJuz !== 1 || status.currentAyah !== 1) && (
              <div className="win-box bg-green-100 dark:bg-green-900 p-3">
                <strong>{t('ctrl.current_progress')}:</strong>
                <div className="mt-1">
                  <span className="font-quran-arabic text-lg">{status.currentSurahArabic}</span> ({status.currentSurahEnglish})
                  <br />
                  <span className="text-sm">{t('ctrl.juz')} {status.currentJuz}, {t('ctrl.ayah')} {status.currentAyah}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleToggleKhatma}
                className={`win-button ${todaySchedule.isKhatma ? "bg-yellow-500" : ""}`}
              >
                {todaySchedule.isKhatma ? t('ctrl.unmark_khatma') : t('ctrl.mark_khatma')}
              </button>
              
              <button
                onClick={() => {
                  setExceptionNote(todaySchedule.exceptionNote || "");
                  setShowExceptionModal(true);
                }}
                className="win-button"
              >
                {todaySchedule.exceptionNote ? t('ctrl.edit_exception') : t('ctrl.add_exception')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">{t('ctrl.no_today')}</p>
        )}
      </WindowBox>

      {/* Record Progress */}
      <WindowBox title={t('ctrl.record_title')}>
        <form onSubmit={handleUpdateProgress} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('ctrl.record_desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold mb-1">{t('ctrl.stopped_surah')}:</label>
              <select
                value={progressForm.stoppedAtSurah}
                onChange={(e) =>
                  setProgressForm({
                    ...progressForm,
                    stoppedAtSurah: Number(e.target.value),
                  })
                }
                className="win-select w-full"
              >
                {surahsInSelectedJuz.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.english}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">{t('ctrl.stopped_juz')}:</label>
              <select
                value={progressForm.stoppedAtJuz}
                onChange={(e) => {
                  const newJuz = Number(e.target.value);
                  const surahsInJuz = SURAHS.filter(s => s.juz === newJuz);
                  setProgressForm({
                    ...progressForm,
                    stoppedAtJuz: newJuz,
                    stoppedAtSurah: surahsInJuz.length > 0 ? surahsInJuz[0].number : 1,
                  });
                }}
                className="win-select w-full"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <option key={juz} value={juz}>
                    {t('ctrl.juz')} {juz} - {locale === 'ar' ? getJuzName(juz)?.arabic : getJuzName(juz)?.english}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">{t('ctrl.stopped_ayah')}:</label>
              <input
                type="number"
                min="1"
                value={progressForm.stoppedAtAyah}
                onChange={(e) =>
                  setProgressForm({
                    ...progressForm,
                    stoppedAtAyah: Number(e.target.value),
                  })
                }
                className="win-input w-full"
              />
            </div>
          </div>

          <button type="submit" className="win-button">
            {t('ctrl.save_progress')}
          </button>
        </form>
      </WindowBox>

      {/* Exception Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 win-box max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('ctrl.exception_title')}</h3>
              <button
                onClick={() => setShowExceptionModal(false)}
                className="win-button text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('ctrl.exception_desc')}
            </p>

            <textarea
              value={exceptionNote}
              onChange={(e) => setExceptionNote(e.target.value)}
              className="win-input w-full h-24"
              placeholder={t('ctrl.exception_placeholder')}
            />

            <div className="flex gap-2 mt-4">
              <button onClick={handleSaveException} className="win-button">
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowExceptionModal(false)}
                className="win-button"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Schedules Overview */}
      <WindowBox title={t('ctrl.full_schedule')}>
        {allSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="win-table text-sm">
              <thead>
                <tr>
                  <th>{t('ctrl.day_col')}</th>
                  <th>{t('ctrl.date_col')}</th>
                  <th>{t('ctrl.juz_col')}</th>
                  <th>{t('ctrl.surahs_col')}</th>
                  <th>{t('ctrl.time_col')}</th>
                  <th>{t('ctrl.status_col')}</th>
                  <th>{t('ctrl.actions_col')}</th>
                </tr>
              </thead>
              <tbody>
                {allSchedules.map((schedule) => (
                  <tr key={schedule.id} className={schedule.isKhatma ? "bg-yellow-100 dark:bg-yellow-900" : ""}>
                    <td className="font-bold">{t('ctrl.day_col')} {schedule.ramadanDayNumber}</td>
                    <td>{new Date(schedule.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</td>
                    <td>
                      {schedule.juzStart}-{schedule.juzEnd}
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {getJuzName(schedule.juzStart)?.english}
                      </div>
                    </td>
                    <td>
                      <span className="font-quran-arabic">{schedule.surahArabic}</span>
                      <br />
                      <span className="text-xs">{schedule.surahEnglish}</span>
                    </td>
                    <td>{schedule.time}</td>
                    <td>
                      {schedule.isKhatma && <span className="text-yellow-600">⭐ الختمة</span>}
                      {schedule.exceptionNote && <span className="text-orange-600">⚠️</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleKhatmaForDay(schedule.id, schedule.isKhatma)}
                        className={`win-button text-xs ${
                          schedule.isKhatma ? "bg-yellow-500" : ""
                        }`}
                        title={schedule.isKhatma ? "Unmark as الختمة" : "Mark as الختمة"}
                      >
                        {schedule.isKhatma ? "⭐ ✓" : "⭐"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {t('ctrl.no_schedules')}
          </p>
        )}
      </WindowBox>
    </div>
  );
}
