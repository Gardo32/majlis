"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { LiveIndicator } from "@/components/LiveIndicator";

interface MajlisStatus {
  radioStreamUrl: string;
  youtubeVideoId: string | null;
  youtubeLiveUrl: string | null;
  isLive: boolean;
}

export default function MajlisDashboard() {
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
      setError("Failed to load status");
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
        setMessage("Settings updated successfully");
        fetchStatus();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update settings");
      }
    } catch (err) {
      setError("Failed to update settings");
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
        setMessage(`Stream is now ${!formData.isLive ? "LIVE" : "OFFLINE"}`);
        fetchStatus();
      } else {
        setError("Failed to toggle live status");
      }
    } catch (err) {
      setError("Failed to toggle live status");
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
      <WindowBox title="📻 Majlis Dashboard - Streaming Management">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage YouTube Live streaming or audio-only stream URL and live status.
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
      <WindowBox title="📡 Live Status Control">
        <div className="space-y-4">
          <div className="flex items-center justify-between win-box p-4">
            <div>
              <div className="font-bold mb-2">Current Status:</div>
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
              {formData.isLive ? "🔴 Go OFFLINE" : "🟢 Go LIVE"}
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Note:</strong> Toggle the live status when the Majlis
              stream is active. This indicator shows viewers whether the stream
              is currently broadcasting.
            </p>
          </div>
        </div>
      </WindowBox>

      {/* YouTube Live Configuration */}
      <WindowBox title="📺 YouTube Live Configuration (Recommended)">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">YouTube Video ID:</label>
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
              Enter the YouTube video ID from your live stream URL.
              For example, from https://youtu.be/dQw4w9WgXcQ, enter: dQw4w9WgXcQ
            </p>
          </div>

          {formData.youtubeVideoId && (
            <div className="win-box bg-blue-50 dark:bg-blue-950 p-3">
              <strong>Preview URL:</strong>{" "}
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
            💾 Save YouTube Stream
          </button>
        </form>
      </WindowBox>

      {/* Audio-Only Stream (Legacy) */}
      <WindowBox title="🔗 Audio-Only Stream URL (Optional - Legacy)">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Audio Stream URL:</label>
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
              Optional: Enter an audio-only stream URL if not using YouTube
            </p>
          </div>

          <button type="submit" className="win-button">
            💾 Save Audio Stream
          </button>
        </form>
      </WindowBox>

      {/* Current Settings Display */}
      <WindowBox title="ℹ️ Current Settings">
        <div className="space-y-2">
          <div className="win-box p-2">
            <strong>YouTube Video ID:</strong>{" "}
            {status?.youtubeVideoId || "(Not configured)"}
          </div>
          <div className="win-box p-2">
            <strong>Audio Stream URL:</strong>{" "}
            {status?.radioStreamUrl || "(Not configured)"}
          </div>
          <div className="win-box p-2">
            <strong>Live Status:</strong>{" "}
            {status?.isLive ? "🟢 LIVE" : "⚫ OFFLINE"}
          </div>
        </div>
      </WindowBox>

      {/* YouTube Live Setup Instructions */}
      <WindowBox title="⚙️ YouTube Live Setup Guide">
        <div className="space-y-3 text-sm">
          <p className="font-bold">To set up YouTube Live streaming:</p>

          <div className="win-box p-3">
            <strong>1.</strong> Go to{" "}
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
            <strong>2.</strong> Click "Create" → "Go live"
          </div>

          <div className="win-box p-3">
            <strong>3.</strong> Choose streaming software (like OBS Studio, vMix, or mobile app)
          </div>

          <div className="win-box p-3">
            <strong>4.</strong> Configure your stream (title, description, privacy settings)
          </div>

          <div className="win-box p-3">
            <strong>5.</strong> Start your stream and copy the Video ID from the URL
          </div>

          <div className="win-box p-3">
            <strong>6.</strong> Enter the Video ID above and toggle "Go LIVE"
          </div>

          <div className="mt-4 win-box bg-yellow-50 dark:bg-yellow-950 p-3 text-yellow-800 dark:text-yellow-200">
            <strong>💡 Tip:</strong> YouTube Live provides free, high-quality video and audio
            streaming to unlimited viewers without managing your own servers!
          </div>
        </div>
      </WindowBox>
    </div>
  );
}
