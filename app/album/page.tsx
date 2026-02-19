"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface AlbumItem {
  id: string;
  blobUrl: string;
  fileName: string;
  mimeType: string;
  caption: string | null;
  createdAt: string;
  uploadedBy: { name: string };
}

function isVideo(item: AlbumItem) {
  return item.mimeType?.startsWith("video/");
}

function MediaThumb({ item, onClick }: { item: AlbumItem; onClick: () => void }) {
  if (isVideo(item)) {
    return (
      <button
        className="group relative w-full aspect-square bg-black overflow-hidden focus:outline-none"
        onClick={onClick}
        aria-label={item.caption || item.fileName}
      >
        <video
          src={item.blobUrl}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          muted
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-black/80 transition-colors">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {item.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {item.caption}
          </div>
        )}
      </button>
    );
  }
  return (
    <button
      className="group relative w-full aspect-square overflow-hidden focus:outline-none"
      onClick={onClick}
      aria-label={item.caption || item.fileName}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.blobUrl}
        alt={item.caption || item.fileName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {item.caption}
        </div>
      )}
    </button>
  );
}

export default function AlbumPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/album")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => setError(t("common.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const open = useCallback((index: number) => setActiveIndex(index), []);
  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i - 1 + items.length) % items.length : null));
  }, [items.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i + 1) % items.length : null));
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, prev, next]);

  useEffect(() => {
    videoRef.current?.pause();
  }, [activeIndex]);

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <span className="text-lg font-bold"> {t("album.title")}</span>
          {!loading && items.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {items.filter((i) => !isVideo(i)).length} {t("album.photos")}  {items.filter(isVideo).length} {t("album.videos")}
            </span>
          )}
        </div>

        <div className="p-2">
          {loading && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {t("common.loading")}
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <span className="text-4xl"></span>
              <p>{t("album.empty")}</p>
            </div>
          )}
          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {items.map((item, idx) => (
                <MediaThumb key={item.id} item={item} onClick={() => open(idx)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {active !== null && activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={close}>
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white/80 text-sm">
              {activeIndex + 1} / {items.length}
              {active.caption && (
                <span className="ml-3 text-white font-medium">{active.caption}</span>
              )}
            </div>
            <button
              onClick={close}
              className="text-white/70 hover:text-white text-2xl leading-none px-2"
              aria-label="Close"
            >
              
            </button>
          </div>

          {/* Media area */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={close}>
            <button
              className="absolute left-2 z-10 text-white/60 hover:text-white text-5xl px-3 py-8 select-none"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              
            </button>

            <div
              className="max-w-5xl max-h-full flex items-center justify-center px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(active) ? (
                <video
                  ref={videoRef}
                  key={active.id}
                  src={active.blobUrl}
                  controls
                  autoPlay
                  className="max-h-[80vh] max-w-full rounded shadow-2xl"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={active.id}
                  src={active.blobUrl}
                  alt={active.caption || active.fileName}
                  className="max-h-[80vh] max-w-full object-contain select-none"
                  draggable={false}
                />
              )}
            </div>

            <button
              className="absolute right-2 z-10 text-white/60 hover:text-white text-5xl px-3 py-8 select-none"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              
            </button>
          </div>

          {/* Bottom bar with thumbnail strip */}
          <div className="bg-black/80 px-4 py-2" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs text-center mb-2">
              {active.uploadedBy.name}  {new Date(active.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-1 justify-center overflow-x-auto pb-1">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-shrink-0 w-12 h-12 overflow-hidden border-2 transition-all ${
                    idx === activeIndex
                      ? "border-white scale-110"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {isVideo(item) ? (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.blobUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}