"use client";

import { useState, useRef } from "react";

interface RadioPlayerProps {
  streamUrl: string;
  isLive: boolean;
}

export function RadioPlayer({ streamUrl, isLive }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current || !streamUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="space-y-2">
      <audio ref={audioRef} src={streamUrl} />
      
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          disabled={!streamUrl || !isLive}
          className="win-button"
        >
          {isPlaying ? "⏹️ Stop" : "▶️ Play"}
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
          <span className="text-sm w-10">{volume}%</span>
        </div>
      </div>

      {!isLive && (
        <div className="text-sm text-red-800 border-2 border-red-800 bg-red-100 p-2">
          ⚠️ Stream is currently offline
        </div>
      )}

      {!streamUrl && (
        <div className="text-sm text-gray-600 border-2 border-gray-400 bg-gray-100 p-2">
          ℹ️ No stream URL configured
        </div>
      )}
    </div>
  );
}
