"use client";

import { useState, useRef } from "react";

interface RadioPlayerProps {
  streamUrl?: string;
  youtubeVideoId?: string | null;
  isLive: boolean;
}

export function RadioPlayer({ streamUrl, youtubeVideoId, isLive }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasYouTube = youtubeVideoId && youtubeVideoId.trim() !== "";
  const hasAudioStream = streamUrl && streamUrl.trim() !== "";

  const togglePlay = () => {
    if (!audioRef.current || !hasAudioStream) return;

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

  // If YouTube video is configured, show YouTube embed
  if (hasYouTube) {
    return (
      <div className="space-y-3">
        {isLive ? (
          <div className="aspect-video w-full win-box">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0&modestbranding=1`}
              title="YouTube Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="win-box bg-gray-200 dark:bg-gray-800 p-8 text-center aspect-video flex items-center justify-center">
            <div>
              <p className="text-2xl mb-2">📺</p>
              <p className="text-sm text-muted-foreground">Stream is currently offline</p>
            </div>
          </div>
        )}

        <div className="win-box bg-blue-100 dark:bg-blue-900 p-3 text-sm">
          <strong>YouTube Live:</strong>{" "}
          <a 
            href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline"
          >
            Watch on YouTube
          </a>
        </div>

        {!isLive && (
          <div className="text-sm text-red-800 dark:text-red-200 win-box bg-red-100 dark:bg-red-900 p-2 font-bold">
            ⚠️ Stream is currently offline
          </div>
        )}
      </div>
    );
  }

  // Fallback to audio stream if YouTube not configured
  if (hasAudioStream) {
    return (
      <div className="space-y-2">
        <audio ref={audioRef} src={streamUrl || undefined} />

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            disabled={!isLive}
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
          <div className="text-sm text-red-800 dark:text-red-200 win-box bg-red-100 dark:bg-red-900 p-2 font-bold">
            ⚠️ Stream is currently offline
          </div>
        )}
      </div>
    );
  }

  // No stream configured
  return (
    <div className="win-box bg-muted p-8 text-center">
      <p className="text-2xl mb-2">📻</p>
      <p className="text-sm text-muted-foreground">
        No stream configured. Contact the Majlis administrator.
      </p>
    </div>
  );
}
