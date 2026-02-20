"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { WindowBox } from "@/components/WindowBox";
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

function AlbumDashboardContent() {
  const { t } = useLanguage();
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"preparing" | "uploading" | "registering" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Abort any in-flight XHR on unmount
  useEffect(() => () => { xhrRef.current?.abort(); }, []);

  useEffect(() => {
    fetchStatus();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/album?status=1");
      if (res.ok) setConfigured((await res.json()).configured);
    } catch { setConfigured(false); }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/album");
      if (res.ok) setItems(await res.json());
    } catch { setError(t("common.error")); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(files);
    // Revoke old preview URLs
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    if (files.length > 0) {
      setPreviews(
        files.map((file) => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith("video/") ? "video" as const : "image" as const,
        }))
      );
    } else {
      setPreviews([]);
    }
  };

  // Direct-to-Azure upload via XHR (supports progress tracking)
  const uploadDirectToAzure = (
    uploadUrl: string,
    file: File,
    mimeType: string
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
      xhr.setRequestHeader("Content-Type", mimeType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadPhase("uploading");
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Azure upload failed (${xhr.status}). If this is a CORS error, make sure the storage account has CORS rules allowing PUT from this origin.`));
      };
      xhr.onerror = () => {
        xhrRef.current = null;
        reject(new Error("Network error during direct upload. This is usually a CORS misconfiguration on the Azure Storage account — add a CORS rule allowing PUT from this site."));
      };
      xhr.onabort = () => {
        xhrRef.current = null;
        reject(new Error("Upload cancelled"));
      };
      xhr.send(file);
    });

  const DIRECT_UPLOAD_THRESHOLD = 8 * 1024 * 1024; // 8 MB — stay under Vercel's limit

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (selectedFiles.length === 0) { setError(t("album.no_file")); return; }
    setUploading(true);
    setUploadProgress(0);
    setUploadCurrent(0);
    setUploadTotal(selectedFiles.length);
    setUploadPhase("");

    let successCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadCurrent(i + 1);
        setUploadProgress(0);
        setUploadPhase("");

        const useDirect =
          file.type.startsWith("video/") ||
          file.size > DIRECT_UPLOAD_THRESHOLD;

        if (useDirect) {
          // Step 1: get a write SAS URL from the server
          setUploadPhase("preparing");
          const sasRes = await fetch(
            `/api/album/sas?fileName=${encodeURIComponent(file.name)}&mimeType=${encodeURIComponent(file.type)}`
          );
          if (!sasRes.ok) {
            const d = await sasRes.json();
            throw new Error(d.error || "Failed to get upload URL");
          }
          const { uploadUrl, blobName } = await sasRes.json();

          // Step 2: PUT directly to Azure (no Vercel body limit)
          setUploadPhase("uploading");
          await uploadDirectToAzure(uploadUrl, file, file.type);

          // Step 3: register the uploaded blob in the DB
          setUploadPhase("registering");
          const regRes = await fetch("/api/album", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blobName,
              fileName: file.name,
              mimeType: file.type,
              caption: i === 0 && caption.trim() ? caption.trim() : undefined,
            }),
          });
          if (!regRes.ok) {
            const d = await regRes.json();
            throw new Error(d.error || "Failed to register upload");
          }
        } else {
          // Small image — proxy through Vercel (simpler, no extra roundtrip)
          setUploadPhase("uploading");
          const formData = new FormData();
          formData.append("file", file);
          if (i === 0 && caption.trim()) formData.append("caption", caption.trim());
          const res = await fetch("/api/album", { method: "POST", body: formData });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || t("common.error"));
          }
          setUploadProgress(100);
        }

        successCount++;
      }

      if (successCount > 1) {
        setMessage(t("album.upload_batch_success").replace("{count}", String(successCount)));
      } else {
        setMessage(t("album.upload_success"));
      }
      setSelectedFiles([]); setCaption("");
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setUploading(false); setUploadProgress(0);
      setUploadCurrent(0); setUploadTotal(0);
      setUploadPhase("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("album.delete_confirm"))) return;
    setMessage(""); setError("");
    try {
      const res = await fetch(`/api/album/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage(t("album.delete_success"));
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (items[activeIndex ?? -1]?.id === id) setActiveIndex(null);
      } else {
        setError((await res.json()).error || t("common.error"));
      }
    } catch { setError(t("common.error")); }
  };

  const open = useCallback((index: number) => setActiveIndex(index), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => setActiveIndex((i) => (i !== null ? (i - 1 + items.length) % items.length : null)), [items.length]);
  const next = useCallback(() => setActiveIndex((i) => (i !== null ? (i + 1) % items.length : null)), [items.length]);

  const handleDownload = useCallback(async (item: AlbumItem) => {
    try {
      const res = await fetch(item.blobUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
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

  return (
    <div className="space-y-4">
      <WindowBox title={t("album.dashboard_title")}>
        <p className="text-sm text-muted-foreground">{t("album.dashboard_desc")}</p>
      </WindowBox>

      {message && (
        <div className="p-3 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {configured === false && (
        <WindowBox title="Azure Blob Storage">
          <p className="text-sm text-muted-foreground">
            Azure Blob Storage is not configured. Set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY in environment variables.
          </p>
        </WindowBox>
      )}

      {configured !== false && (
        <>
          <WindowBox title={t("album.upload_title")}>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("album.select_media")}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="win-input w-full"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("album.file_hint_media")}
                </p>
                {selectedFiles.length > 1 && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    {t("album.files_selected").replace("{count}", String(selectedFiles.length))}
                  </p>
                )}
              </div>

              {previews.length > 0 && (
                <div className="border-2 border-border">
                  <div className={`grid gap-1 p-1 ${previews.length === 1 ? "" : "grid-cols-3 sm:grid-cols-4"}`}>
                    {previews.map((p, idx) => (
                      <div key={idx} className="relative">
                        {p.type === "video" ? (
                          <video
                            src={p.url}
                            controls
                            className={previews.length === 1 ? "max-h-48 w-full bg-black" : "w-full aspect-square object-cover bg-black"}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.url} alt="Preview" className={previews.length === 1 ? "max-h-48 w-full object-contain bg-secondary" : "w-full aspect-square object-cover bg-secondary"} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("album.caption")} ({t("album.optional")})
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("album.caption_placeholder")}
                  className="win-input w-full"
                  maxLength={200}
                />
              </div>

              {uploading && (
                <div className="space-y-1">
                  <div className="w-full bg-secondary border border-border h-4 overflow-hidden relative">
                    {/* Indeterminate stripe when preparing or registering (no byte progress) */}
                    {(uploadPhase === "preparing" || uploadPhase === "registering" || (uploadPhase === "uploading" && uploadProgress === 0)) ? (
                      <div className="absolute inset-0 bg-primary opacity-70 animate-pulse" />
                    ) : (
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {uploadPhase === "preparing" && `${uploadTotal > 1 ? `(${uploadCurrent}/${uploadTotal}) ` : ""}Preparing upload…`}
                    {uploadPhase === "registering" && `${uploadTotal > 1 ? `(${uploadCurrent}/${uploadTotal}) ` : ""}Saving…`}
                    {uploadPhase === "uploading" && (
                      uploadTotal > 1
                        ? `(${uploadCurrent}/${uploadTotal}) ${uploadProgress > 0 ? `${uploadProgress}%` : "Uploading…"}`
                        : uploadProgress > 0 ? `${uploadProgress}%` : "Uploading…"
                    )}
                    {uploadPhase === "" && t("album.uploading")}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="win-button w-full"
              >
                {uploading ? t("album.uploading") : t("album.upload_btn")}
              </button>
            </form>
          </WindowBox>

          {loading ? (
            <WindowBox title={t("common.loading")}>
              <p className="text-center py-8">{t("common.loading")}</p>
            </WindowBox>
          ) : items.length === 0 ? (
            <WindowBox title={t("album.no_images")}>
              <p className="text-center py-8 text-muted-foreground">{t("album.empty")}</p>
            </WindowBox>
          ) : (
            <WindowBox title={`${t("album.gallery")} (${items.length})`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="border-2 border-border group">
                    <div className="relative cursor-pointer" onClick={() => open(idx)}>
                      {isVideo(item) ? (
                        <div className="w-full aspect-square bg-black flex items-center justify-center">
                          <svg className="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.blobUrl}
                          alt={item.caption || item.fileName}
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                      )}
                      {isVideo(item) && (
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                          VIDEO
                        </div>
                      )}
                    </div>
                    {item.caption && (
                      <div className="p-1 text-xs text-center truncate bg-secondary border-t border-border">
                        {item.caption}
                      </div>
                    )}
                    <div className="p-1 flex justify-between items-center border-t border-border">
                      <span className="text-xs text-muted-foreground truncate">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="win-button text-xs text-red-600 ml-1 flex-shrink-0"
                        title={t("album.delete")}
                      >
                        
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </WindowBox>
          )}
        </>
      )}

      {/* Full-screen lightbox */}
      {active !== null && activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={close}>
          <div
            className="flex items-center justify-between px-4 py-3 bg-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white/80 text-sm">
              {activeIndex + 1} / {items.length}
              {active.caption && <span className="ml-3 text-white font-medium">{active.caption}</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(active); }}
                className="text-white/70 hover:text-white text-sm px-3 py-1 border border-white/30 hover:border-white/70 rounded transition-colors flex items-center gap-1"
                aria-label="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11" />
                </svg>
                <span className="hidden sm:inline">{t("album.download")}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(active.id); }}
                className="win-button text-red-400 text-sm"
              >
                🗑️ {t("album.delete")}
              </button>
              <button onClick={close} className="text-white/70 hover:text-white text-2xl leading-none px-2">
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={close}>
            <button
              className="absolute left-2 z-10 text-white/60 hover:text-white text-5xl px-3 py-8 select-none"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            ></button>

            <div className="max-w-5xl max-h-full flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
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
            ></button>
          </div>

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
    </div>
  );
}

export default function AlbumDashboard() {
  return (
    <Suspense>
      <AlbumDashboardContent />
    </Suspense>
  );
}