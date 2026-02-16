"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { LiveIndicator } from "@/components/LiveIndicator";

interface MajlisStatus {
  radioStreamUrl: string;
  isLive: boolean;
}

export default function MajlisDashboard() {
  const [status, setStatus] = useState<MajlisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
          radioStreamUrl: data.radioStreamUrl,
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

    try {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      <WindowBox title="📻 Majlis Dashboard - Radio Management">
        <p className="text-sm text-gray-600">
          Manage the radio stream URL and live status indicator.
        </p>
      </WindowBox>

      {message && (
        <div className="border-2 border-green-600 bg-green-100 p-3 text-green-800">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="border-2 border-red-600 bg-red-100 p-3 text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Live Status Toggle */}
      <WindowBox title="📡 Live Status Control">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-2 border-black p-4 bg-gray-50">
            <div>
              <div className="font-bold mb-2">Current Status:</div>
              <LiveIndicator isLive={formData.isLive} />
            </div>

            <button
              onClick={toggleLive}
              className={`win-button text-lg px-8 py-2 ${
                formData.isLive
                  ? "bg-red-200 hover:bg-red-300"
                  : "bg-green-200 hover:bg-green-300"
              }`}
            >
              {formData.isLive ? "🔴 Go OFFLINE" : "🟢 Go LIVE"}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Note:</strong> Toggle the live status when the Majlis
              stream is active. This indicator shows viewers whether the stream
              is currently broadcasting.
            </p>
          </div>
        </div>
      </WindowBox>

      {/* Stream URL Settings */}
      <WindowBox title="🔗 Stream URL Configuration">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Radio Stream URL:</label>
            <input
              type="url"
              value={formData.radioStreamUrl}
              onChange={(e) =>
                setFormData({ ...formData, radioStreamUrl: e.target.value })
              }
              placeholder="https://your-icecast-server.com/stream"
              className="win-input w-full"
            />
            <p className="text-sm text-gray-600 mt-1">
              Enter the full URL of your Icecast or audio stream
            </p>
          </div>

          <button type="submit" className="win-button">
            💾 Save Stream URL
          </button>
        </form>
      </WindowBox>

      {/* Current Settings Display */}
      <WindowBox title="ℹ️ Current Settings">
        <div className="space-y-2">
          <div className="border border-black p-2 bg-gray-50">
            <strong>Stream URL:</strong>{" "}
            {status?.radioStreamUrl || "(Not configured)"}
          </div>
          <div className="border border-black p-2 bg-gray-50">
            <strong>Live Status:</strong>{" "}
            {status?.isLive ? "🟢 LIVE" : "⚫ OFFLINE"}
          </div>
        </div>
      </WindowBox>

      {/* Icecast Setup Instructions */}
      <WindowBox title="⚙️ Icecast Setup Guide">
        <div className="space-y-3 text-sm">
          <p className="font-bold">To set up your Icecast stream:</p>

          <div className="border border-black p-3 bg-gray-50">
            <strong>1.</strong> Install Icecast on your server
          </div>

          <div className="border border-black p-3 bg-gray-50">
            <strong>2.</strong> Configure a mount point (e.g., /stream)
          </div>

          <div className="border border-black p-3 bg-gray-50">
            <strong>3.</strong> Use a source client (like BUTT or Mixxx) to
            broadcast
          </div>

          <div className="border border-black p-3 bg-gray-50">
            <strong>4.</strong> Enter your stream URL above (e.g.,
            http://server:8000/stream)
          </div>

          <div className="border border-black p-3 bg-gray-50">
            <strong>5.</strong> Toggle "Go LIVE" when broadcasting
          </div>
        </div>
      </WindowBox>
    </div>
  );
}
