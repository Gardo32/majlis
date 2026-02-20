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

const PAGE_SIZE = 24;
const SESSION_KEY = "album_cache";
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes

function isVideo(item: AlbumItem) {
  return item.mimeType?.startsWith("video/");
}

// Intersection-observer lazy image — starts loading 400 px before entering viewport
function LazyImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className="block relative w-full h-full">
      {!loaded && <span className="absolute inset-0 bg-secondary animate-pulse" />}
      {inView && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}

function MediaThumb({ item, onClick }: { item: AlbumItem; onClick: () => void }) {
  if (isVideo(item)) {
    // No <video> element in thumbnails — avoids N network requests for metadata
    return (
      <button
        className="group relative w-full aspect-square bg-neutral-900 overflow-hidden focus:outline-none"
        onClick={onClick}
        aria-label={item.caption || item.fileName}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-black/80 transition-colors">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded leading-tight">VIDEO</span>
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
      <LazyImg
        src={item.blobUrl}
        alt={item.caption || item.fileName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Return cached data instantly, then re-validate in the background
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached) as { data: AlbumItem[]; ts: number };
        if (Date.now() - ts < SESSION_TTL) {
          setItems(data);
          setLoading(false);
          return; // still fresh — skip network
        }
        // Stale but show it immediately while we refetch
        setItems(data);
        setLoading(false);
      }
    } catch { /* ignore */ }

    fetch("/api/album")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: AlbumItem[]) => {
        setItems(data);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ data, ts: Date.now() }));
        } catch { /* quota exceeded */ }
      })
      .catch(() => setError(t("common.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const open = useCallback((index: number) => setActiveIndex(index), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() =>
    setActiveIndex((i) => (i !== null ? (i - 1 + items.length) % items.length : null)),
    [items.length]);
  const next = useCallback(() =>
    setActiveIndex((i) => (i !== null ? (i + 1) % items.length : null)),
    [items.length]);

  const handleDownload = useCallback(async (item: AlbumItem) => {
    try {
      const res = await fetch(item.blobUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = item.fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.blobUrl, "_blank");
    }
  }, []);

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

  useEffect(() => { videoRef.current?.pause(); }, [activeIndex]);

  const active = activeIndex !== null ? items[activeIndex] : null;
  const visibleItems = items.slice(0, page * PAGE_SIZE);
  const hasMore = visibleItems.length < items.length;

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <span className="text-lg font-bold">{t("album.title")}</span>
          {!loading && items.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {items.filter((i) => !isVideo(i)).length} {t("album.photos")}
              {" · "}
              {items.filter(isVideo).length} {t("album.videos")}
            </span>
          )}
        </div>

        <div className="p-2">
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-secondary animate-pulse" />
              ))}
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <span className="text-4xl">📭</span>
              <p>{t("album.empty")}</p>
            </div>
          )}

          {visibleItems.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                {visibleItems.map((item, idx) => (
                  <MediaThumb key={item.id} item={item} onClick={() => open(idx)} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-4 pb-4">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2 border border-border text-sm hover:bg-secondary transition-colors"
                  >
                    {t("album.load_more") ?? "Load more"} ({items.length - visibleItems.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {active !== null && activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={close}>
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
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(active); }}
                className="text-white/70 hover:text-white text-sm px-3 py-1 border border-white/30 hover:border-white/70 rounded transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11" />
                </svg>
                <span className="hidden sm:inline">{t("album.download")}</span>
              </button>
              <button onClick={close} className="text-white/70 hover:text-white text-2xl leading-none px-2">✕</button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={close}>
            <button
              className="absolute left-2 z-10 text-white/60 hover:text-white text-5xl px-3 py-8 select-none"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >‹</button>

            <div className="max-w-5xl max-h-full flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
              {isVideo(active) ? (
                <video
                  ref={videoRef}
                  key={active.id}
                  src={active.blobUrl}
                  controls
                  autoPlay
                  preload="auto"
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
            >›</button>
          </div>

          <div className="bg-black/80 px-4 py-2" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs text-center mb-2">
              {active.uploadedBy.name} · {new Date(active.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-1 justify-center overflow-x-auto pb-1">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-shrink-0 w-12 h-12 overflow-hidden border-2 transition-all ${
                    idx === activeIndex ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-80"
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
