"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { getJuzName } from "@/lib/surah-data";
import { useLanguage } from "@/components/LanguageProvider";
import { computeDynamicSchedule, type DynamicScheduleEntry } from "@/lib/schedule-utils";

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
  stoppedAtJuz: number | null;
  completedLastJuz: boolean | null;
}

export default function ControllerDashboard() {
  const { t, locale } = useLanguage();
  const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [dynamicSchedules, setDynamicSchedules] = useState<DynamicScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Record stopping form
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [stoppedAtJuz, setStoppedAtJuz] = useState<number>(1);
  const [completedLastJuz, setCompletedLastJuz] = useState<boolean>(true);

  // Exception form
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionNote, setExceptionNote] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const schedulesRes = await fetch("/api/schedules");

      if (schedulesRes.ok) {
        const schedules: Schedule[] = await schedulesRes.json();
        setAllSchedules(schedules);

        // Compute dynamic schedule
        const dynamic = computeDynamicSchedule(schedules);
        setDynamicSchedules(dynamic);

        // Find today's schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];

        const todayItem = schedules.find((s: Schedule) => {
          const scheduleDate = new Date(s.date);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate.toISOString().split("T")[0] === todayStr;
        });

        setTodaySchedule(todayItem || null);

        // Default selection to today's schedule
        if (todayItem) {
          setSelectedDayId(todayItem.id);
          if (todayItem.stoppedAtJuz) {
            setStoppedAtJuz(todayItem.stoppedAtJuz);
            setCompletedLastJuz(todayItem.completedLastJuz ?? true);
          } else {
            setStoppedAtJuz(todayItem.juzEnd);
            setCompletedLastJuz(true);
          }
        }
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (dayId: string) => {
    setSelectedDayId(dayId);
    const schedule = allSchedules.find(s => s.id === dayId);
    if (schedule) {
      if (schedule.stoppedAtJuz) {
        setStoppedAtJuz(schedule.stoppedAtJuz);
        setCompletedLastJuz(schedule.completedLastJuz ?? true);
      } else {
        const dynamic = dynamicSchedules.find(d => d.id === dayId);
        setStoppedAtJuz(dynamic?.dynamicJuzEnd || schedule.juzEnd);
        setCompletedLastJuz(true);
      }
    }
  };

  const handleRecordStopping = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedDayId) {
      setError(t('ctrl.select_day_error'));
      return;
    }

    try {
      const res = await fetch(`/api/schedules/${selectedDayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stoppedAtJuz: stoppedAtJuz,
          completedLastJuz: completedLastJuz,
        }),
      });

      if (res.ok) {
        setMessage(t('ctrl.progress_saved'));
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleClearRecording = async (scheduleId: string) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stoppedAtJuz: null,
          completedLastJuz: null,
        }),
      });

      if (res.ok) {
        setMessage(t('ctrl.recording_cleared'));
        await fetchData();
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
        body: JSON.stringify({ isKhatma: !todaySchedule.isKhatma }),
      });

      if (res.ok) {
        setMessage(todaySchedule.isKhatma ? t('ctrl.unmarked_khatma') : t('ctrl.marked_khatma'));
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
        body: JSON.stringify({ isKhatma: !currentIsKhatma }),
      });

      if (res.ok) {
        setMessage(currentIsKhatma ? t('ctrl.unmarked_khatma') : t('ctrl.marked_khatma'));
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
        body: JSON.stringify({ exceptionNote: exceptionNote || null }),
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

  const getDynamic = (id: string) => dynamicSchedules.find(d => d.id === id);

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
            {(() => {
              const dyn = getDynamic(todaySchedule.id);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span className="font-bold">{t('ctrl.planned_juz')}:</span> {todaySchedule.juzStart}-{todaySchedule.juzEnd}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getJuzName(todaySchedule.juzStart)?.english} - {getJuzName(todaySchedule.juzEnd)?.english}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">{t('ctrl.actual_juz')}:</span>{" "}
                    {dyn ? `${dyn.dynamicJuzStart}-${dyn.dynamicJuzEnd}` : `${todaySchedule.juzStart}-${todaySchedule.juzEnd}`}
                    {dyn?.differsFromPlan && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 ms-2">
                        ({t('ctrl.adjusted')})
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold">{t('ctrl.time')}:</span> {todaySchedule.time}
                  </div>
                  <div>
                    <span className="font-bold">{t('ctrl.surahs')}:</span>{" "}
                    <span className="font-quran-arabic text-xl">{todaySchedule.surahArabic}</span>
                  </div>
                </div>
              );
            })()}

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

            {todaySchedule.stoppedAtJuz != null && (
              <div className="win-box bg-blue-100 dark:bg-blue-900 p-3">
                <strong>✅ {t('ctrl.recorded')}:</strong>{" "}
                {t('ctrl.juz')} {todaySchedule.stoppedAtJuz}
                {todaySchedule.completedLastJuz ? ` (${t('ctrl.completed')})` : ` (${t('ctrl.partial')})`}
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

      {/* Record Where Reading Stopped */}
      <WindowBox title={t('ctrl.record_title')}>
        <form onSubmit={handleRecordStopping} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('ctrl.record_stop_desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select Day */}
            <div>
              <label className="block font-bold mb-1">{t('ctrl.select_day')}:</label>
              <select
                value={selectedDayId}
                onChange={(e) => handleDaySelect(e.target.value)}
                className="win-select w-full"
              >
                <option value="">{t('ctrl.select_day_placeholder')}</option>
                {allSchedules.map((s) => {
                  const dateStr = new Date(s.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <option key={s.id} value={s.id}>
                      {t('home.day')} {s.ramadanDayNumber} - {dateStr}
                      {s.stoppedAtJuz != null ? " ✅" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Stopped At Juz */}
            <div>
              <label className="block font-bold mb-1">{t('ctrl.stopped_juz')}:</label>
              <select
                value={stoppedAtJuz}
                onChange={(e) => setStoppedAtJuz(Number(e.target.value))}
                className="win-select w-full"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <option key={juz} value={juz}>
                    {t('ctrl.juz')} {juz} - {locale === 'ar' ? getJuzName(juz)?.arabic : getJuzName(juz)?.english}
                  </option>
                ))}
              </select>
            </div>

            {/* Completed? */}
            <div>
              <label className="block font-bold mb-1">{t('ctrl.completed_juz_label')}:</label>
              <div className="flex gap-3 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="completedLastJuz"
                    checked={completedLastJuz === true}
                    onChange={() => setCompletedLastJuz(true)}
                  />
                  <span>{t('common.yes')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="completedLastJuz"
                    checked={completedLastJuz === false}
                    onChange={() => setCompletedLastJuz(false)}
                  />
                  <span>{t('common.no')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedDayId && (
            <div className="win-box bg-secondary p-3 text-sm">
              <strong>{t('ctrl.preview')}:</strong>{" "}
              {(() => {
                const schedule = allSchedules.find(s => s.id === selectedDayId);
                if (!schedule) return null;
                const dayNum = schedule.ramadanDayNumber;
                const displayEnd = stoppedAtJuz;
                const dyn = getDynamic(selectedDayId);
                const displayStart = dyn?.dynamicJuzStart || schedule.juzStart;
                const nextStart = completedLastJuz ? stoppedAtJuz + 1 : stoppedAtJuz;
                return (
                  <span>
                    {t('home.day')} {dayNum}: {t('ctrl.juz')} {displayStart}-{displayEnd}
                    {dayNum < 30 && (
                      <span className="ms-3 text-muted-foreground">
                        → {t('home.day')} {dayNum + 1} {t('ctrl.starts_from')} {t('ctrl.juz')} {Math.min(nextStart, 30)}
                      </span>
                    )}
                  </span>
                );
              })()}
            </div>
          )}

          <button type="submit" className="win-button" disabled={!selectedDayId}>
            {t('ctrl.save_recording')}
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

      {/* Full Schedule with Dynamic View */}
      <WindowBox title={t('ctrl.full_schedule')}>
        {dynamicSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="win-table text-sm">
              <thead>
                <tr>
                  <th>{t('ctrl.day_col')}</th>
                  <th>{t('ctrl.date_col')}</th>
                  <th>{t('ctrl.planned_juz')}</th>
                  <th>{t('ctrl.actual_juz')}</th>
                  <th className="hidden sm:table-cell">{t('ctrl.surahs_col')}</th>
                  <th>{t('ctrl.status_col')}</th>
                  <th>{t('ctrl.actions_col')}</th>
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
                          <span className="ms-1 text-xs bg-primary text-primary-foreground px-1">
                            {t('calendar.today')}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {new Date(schedule.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="text-muted-foreground">
                        {schedule.juzStart}-{schedule.juzEnd}
                      </td>
                      <td className={schedule.differsFromPlan ? "font-bold text-blue-600 dark:text-blue-400" : ""}>
                        {schedule.dynamicJuzStart}-{schedule.dynamicJuzEnd}
                        {schedule.isRecorded && <span className="ms-1">✅</span>}
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="font-quran-arabic">{schedule.surahArabic}</span>
                      </td>
                      <td>
                        {schedule.isKhatma && <span className="text-yellow-600">⭐</span>}
                        {schedule.exceptionNote && <span className="text-orange-600 ms-1">⚠️</span>}
                        {schedule.differsFromPlan && !schedule.isRecorded && (
                          <span className="text-blue-500 ms-1" title={t('ctrl.adjusted')}>↻</span>
                        )}
                      </td>
                      <td className="space-x-1">
                        <button
                          onClick={() => handleToggleKhatmaForDay(schedule.id, schedule.isKhatma)}
                          className={`win-button text-xs ${schedule.isKhatma ? "bg-yellow-500" : ""}`}
                          title={schedule.isKhatma ? "Unmark الختمة" : "Mark الختمة"}
                        >
                          ⭐
                        </button>
                        {schedule.isRecorded && (
                          <button
                            onClick={() => handleClearRecording(schedule.id)}
                            className="win-button text-xs"
                            title={t('ctrl.clear_recording')}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
