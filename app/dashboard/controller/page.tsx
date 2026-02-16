"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { getJuzName } from "@/lib/surah-data";

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
}

export default function ControllerDashboard() {
  const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [status, setStatus] = useState<MajlisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Progress form
  const [progressForm, setProgressForm] = useState({
    stoppedAtJuz: 1,
    stoppedAtAyah: 1,
  });

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
        setProgressForm({
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

    try {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentJuz: progressForm.stoppedAtJuz,
          currentAyah: progressForm.stoppedAtAyah,
        }),
      });

      if (res.ok) {
        setMessage("Progress recorded successfully");
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update progress");
      }
    } catch (err) {
      setError("Failed to update progress");
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
        setMessage(`Day ${todaySchedule.isKhatma ? "unmarked" : "marked"} as الختمة`);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update schedule");
      }
    } catch (err) {
      setError("Failed to update schedule");
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
        setMessage("Exception note saved");
        setShowExceptionModal(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save exception");
      }
    } catch (err) {
      setError("Failed to save exception");
    }
  };

  if (loading) {
    return (
      <WindowBox title="Loading...">
        <div className="text-center py-8">Loading dashboard...</div>
      </WindowBox>
    );
  }

  return (
    <div className="space-y-4">
      <WindowBox title="📅 Controller Dashboard">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Record daily progress as the reading happens. The calendar automatically 
          advances 2 juz per day starting from Ramadan day 1.
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
      <WindowBox title="📖 Today's Schedule">
        {todaySchedule ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold">Ramadan Day:</span> {todaySchedule.ramadanDayNumber}
              </div>
              <div>
                <span className="font-bold">Date:</span>{" "}
                {new Date(todaySchedule.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div>
                <span className="font-bold">Expected Juz:</span> {todaySchedule.juzStart}-{todaySchedule.juzEnd}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getJuzName(todaySchedule.juzStart)?.english} - {getJuzName(todaySchedule.juzEnd)?.english}
                </div>
              </div>
              <div>
                <span className="font-bold">Time:</span> {todaySchedule.time}
              </div>
              <div className="col-span-2">
                <span className="font-bold">Surahs:</span>{" "}
                <span className="font-quran-arabic text-xl">{todaySchedule.surahArabic}</span>
                <br />
                <span className="text-sm">{todaySchedule.surahEnglish}</span>
              </div>
            </div>

            {todaySchedule.isKhatma && (
              <div className="win-box bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-3">
                <span className="text-2xl">⭐</span> <strong>الختمة</strong> - Completion Day
              </div>
            )}

            {todaySchedule.exceptionNote && (
              <div className="win-box bg-orange-100 dark:bg-orange-900 p-3">
                <strong>⚠️ Exception:</strong> {todaySchedule.exceptionNote}
              </div>
            )}

            {todaySchedule.actualJuzStart && (
              <div className="win-box bg-blue-100 dark:bg-blue-900 p-3">
                <strong>Actual Progress:</strong> Juz {todaySchedule.actualJuzStart}
                {todaySchedule.actualJuzEnd && todaySchedule.actualJuzEnd !== todaySchedule.actualJuzStart
                  ? `-${todaySchedule.actualJuzEnd}`
                  : ""}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleToggleKhatma}
                className={`win-button ${todaySchedule.isKhatma ? "bg-yellow-500" : ""}`}
              >
                {todaySchedule.isKhatma ? "⭐ Unmark" : "⭐ Mark"} as الختمة
              </button>
              
              <button
                onClick={() => {
                  setExceptionNote(todaySchedule.exceptionNote || "");
                  setShowExceptionModal(true);
                }}
                className="win-button"
              >
                ⚠️ {todaySchedule.exceptionNote ? "Edit" : "Add"} Exception
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No schedule for today. Check with admin to regenerate calendar.</p>
        )}
      </WindowBox>

      {/* Record Progress */}
      <WindowBox title="✍️ Record Where Reading Stopped Today">
        <form onSubmit={handleUpdateProgress} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Record where the majlis stopped reading today. The system will automatically
            know what to read next based on the schedule.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Stopped at Juz:</label>
              <select
                value={progressForm.stoppedAtJuz}
                onChange={(e) =>
                  setProgressForm({
                    ...progressForm,
                    stoppedAtJuz: Number(e.target.value),
                  })
                }
                className="win-select w-full"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <option key={juz} value={juz}>
                    Juz {juz} - {getJuzName(juz)?.english}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Stopped at Ayah:</label>
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
            💾 Save Progress
          </button>
        </form>
      </WindowBox>

      {/* Exception Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 win-box max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">⚠️ Day Exception Note</h3>
              <button
                onClick={() => setShowExceptionModal(false)}
                className="win-button text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Add a note for any timing changes or special circumstances for today.
              (e.g., "Started 30 minutes late" or "Continued from previous day")
            </p>

            <textarea
              value={exceptionNote}
              onChange={(e) => setExceptionNote(e.target.value)}
              className="win-input w-full h-24"
              placeholder="Enter exception note..."
            />

            <div className="flex gap-2 mt-4">
              <button onClick={handleSaveException} className="win-button">
                💾 Save
              </button>
              <button
                onClick={() => setShowExceptionModal(false)}
                className="win-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Schedules Overview */}
      <WindowBox title="📋 Full Ramadan Schedule (30 Days)">
        {allSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="win-table text-sm">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Juz</th>
                  <th>Surahs</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allSchedules.map((schedule) => (
                  <tr key={schedule.id} className={schedule.isKhatma ? "bg-yellow-100 dark:bg-yellow-900" : ""}>
                    <td className="font-bold">Day {schedule.ramadanDayNumber}</td>
                    <td>{new Date(schedule.date).toLocaleDateString()}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No schedules exist. Contact admin to generate calendar.
          </p>
        )}
      </WindowBox>
    </div>
  );
}
