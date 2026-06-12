"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PlanKey = "starter" | "growth" | "pro";
const PLAN_LABELS: Record<PlanKey, string> = { starter: "Starter", growth: "Growth", pro: "Pro" };
const PLAN_LIMITS: Record<PlanKey, number | null> = { starter: 20, growth: 60, pro: null };

// ─── Types ────────────────────────────────────────────────────────────────────

type RoomType = "living_room" | "bedroom" | "bathroom" | "kitchen" | "dining_room" | "home_office";
type Style = "modern" | "boho" | "scandinavian" | "industrial" | "classic" | "japandi";
type Tab = "staging" | "history";

interface Room {
  id: RoomType;
  label: string;
  icon: string;
}

interface StyleOption {
  id: Style;
  label: string;
  desc: string;
}

interface HistoryEntry {
  id: string;
  roomType: RoomType;
  style: Style;
  thumbnail: string; // 128px base64 oryginału
  resultUrl: string;
  createdAt: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ROOMS: Room[] = [
  { id: "living_room", label: "Pokój dzienny", icon: "🛋️" },
  { id: "bedroom", label: "Sypialnia", icon: "🛏️" },
  { id: "bathroom", label: "Łazienka", icon: "🚿" },
  { id: "kitchen", label: "Kuchnia", icon: "🍳" },
  { id: "dining_room", label: "Jadalnia", icon: "🍽️" },
  { id: "home_office", label: "Gabinet", icon: "💼" },
];

const STYLES: StyleOption[] = [
  { id: "modern", label: "Modern", desc: "Nowoczesny, minimalistyczny" },
  { id: "boho", label: "Boho", desc: "Ciepły, eklektyczny" },
  { id: "scandinavian", label: "Skandynawski", desc: "Jasny, naturalny" },
  { id: "industrial", label: "Industrial", desc: "Surowy, loftowy" },
  { id: "classic", label: "Klasyczny", desc: "Elegancki, tradycyjny" },
  { id: "japandi", label: "Japandi", desc: "Zen, minimalizm" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HISTORY_KEY = "roomstager_history";
const MAX_HISTORY = 20;

function resizeImage(file: File, maxPx = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function makeThumbnail(dataUri: string, size = 128): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(size / img.width, size / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = dataUri;
  });
}

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

// ─── Components ───────────────────────────────────────────────────────────────

function UploadZone({
  preview,
  onFile,
}: {
  preview: string | null;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none overflow-hidden
        ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"}
        ${preview ? "aspect-[4/3]" : "aspect-[4/3]"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Podgląd" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-center p-3 bg-gradient-to-t from-black/40 to-transparent">
            <span className="text-white text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
              Dotknij, aby zmienić zdjęcie
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">📷</div>
          <div>
            <p className="font-semibold text-slate-700">Dodaj zdjęcie pomieszczenia</p>
            <p className="text-sm text-slate-500 mt-1">Zrób zdjęcie aparatem lub wybierz z galerii</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  original: originalSrc,
  result: resultSrc,
  onReset,
}: {
  original: string;
  result: string;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<"before" | "after">("after");

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: zakładki przed/po — Desktop: side-by-side */}
      <div className="md:hidden flex gap-2 p-1 bg-slate-100 rounded-xl">
        {(["after", "before"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "after" ? "✨ Po" : "📷 Przed"}
          </button>
        ))}
      </div>

      {/* Mobile: jedno zdjęcie */}
      <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tab === "after" ? resultSrc : originalSrc}
          alt={tab === "after" ? "Wygenerowane wnętrze" : "Oryginalne zdjęcie"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Desktop: oba zdjęcia obok siebie */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">📷 Przed</p>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={originalSrc} alt="Oryginalne zdjęcie" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">✨ Po</p>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultSrc} alt="Wygenerowane wnętrze" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={resultSrc}
          download="staging.jpg"
          className="flex-1 py-3 text-center rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          Pobierz wynik
        </a>
        <button
          onClick={onReset}
          className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          Nowe
        </button>
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({
  entries,
  onDelete,
  onReuse,
}: {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
  onReuse: (entry: HistoryEntry) => void;
}) {
  const room = (id: RoomType) => ROOMS.find((r) => r.id === id);
  const style = (id: Style) => STYLES.find((s) => s.id === id);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">🖼️</div>
        <p className="font-semibold text-slate-700">Brak wygenerowanych wizualizacji</p>
        <p className="text-sm text-slate-400">Wróć do zakładki Staging i wygeneruj pierwsze zdjęcie.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-400 text-right">{entries.length} / {MAX_HISTORY} wizualizacji</p>
      <div className="md:grid md:grid-cols-2 md:gap-3 flex flex-col gap-3">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex gap-3 p-3">
            {/* Thumbnails */}
            <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.thumbnail} alt="Oryginał" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow">→</span>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
              <img src={entry.resultUrl} alt="Wynik" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Meta */}
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <p className="font-semibold text-slate-800 text-sm leading-tight">
                  {room(entry.roomType)?.icon} {room(entry.roomType)?.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{style(entry.style)?.label}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDate(entry.createdAt)}</p>
              </div>
              <div className="flex gap-1.5 mt-2">
                <a
                  href={entry.resultUrl}
                  download="staging.jpg"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                >
                  Pobierz
                </a>
                <button
                  onClick={() => onReuse(entry)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  Użyj ponownie
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="ml-auto px-2.5 py-1.5 rounded-lg text-slate-400 text-xs hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("staging");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType>("living_room");
  const [style, setStyle] = useState<Style>("modern");
  const [isEmpty, setIsEmpty] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // User & subscription state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<PlanKey | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    setHistory(loadHistory());

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserEmail(user.email ?? null);

      const ym = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })();

      const [{ data: sub }, { data: usage }] = await Promise.all([
        supabase.from("subscriptions").select("plan").eq("user_id", user.id).eq("status", "active").maybeSingle(),
        supabase.from("usage").select("count").eq("user_id", user.id).eq("year_month", ym).maybeSingle(),
      ]);

      setUserPlan((sub?.plan as PlanKey) ?? null);
      setUsageCount(usage?.count ?? 0);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setResult(null);
    setError(null);
    const dataUri = await resizeImage(file);
    setImagePreview(dataUri);
    setImageBase64(dataUri);
  }, []);

  const handleGenerate = async () => {
    if (!imageBase64) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, roomType, style, isEmpty }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorCode(data.code ?? null);
        if (data.code === "no_subscription") {
          router.push("/pricing");
          return;
        }
        throw new Error(data.error ?? "Nieznany błąd");
      }

      setErrorCode(null);
      setUsageCount((c) => c + 1);
      setResult(data.imageUrl);

      // Zapisz do historii
      const thumbnail = await makeThumbnail(imageBase64);
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        roomType,
        style,
        thumbnail,
        resultUrl: data.imageUrl,
        createdAt: Date.now(),
      };
      const updated = [entry, ...history];
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const reset = () => {
    setResult(null);
    setImagePreview(null);
    setImageBase64(null);
    setError(null);
    setErrorCode(null);
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter((e) => e.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  const reuseEntry = (entry: HistoryEntry) => {
    setResult(null);
    setError(null);
    setRoomType(entry.roomType);
    setStyle(entry.style);
    setTab("staging");
  };

  return (
    <div className="min-h-svh bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-sm">🏠</div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none">RoomStager</h1>
            <p className="text-xs text-slate-500">AI Virtual Staging</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {userPlan && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  {PLAN_LABELS[userPlan]}
                </span>
                {PLAN_LIMITS[userPlan] !== null && (
                  <span>{usageCount}/{PLAN_LIMITS[userPlan]} gen.</span>
                )}
              </div>
            )}
            {userEmail && (
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                Wyloguj
              </button>
            )}
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex border-t border-slate-100">
          {(["staging", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative
                ${tab === t ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              {t === "staging" ? "Staging" : `Historia${history.length > 0 ? ` (${history.length})` : ""}`}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "history" ? (
          <HistoryPanel entries={history} onDelete={deleteEntry} onReuse={reuseEntry} />
        ) : result ? (
          <ResultPanel original={imagePreview!} result={result} onReset={reset} />
        ) : (
          <div className="md:grid md:grid-cols-2 md:gap-8 flex flex-col gap-6">
            {/* Lewa kolumna — upload */}
            <section className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Zdjęcie pomieszczenia</label>
              <UploadZone preview={imagePreview} onFile={handleFile} />
              <label className="flex items-center gap-2.5 mt-1 cursor-pointer select-none w-fit">
                <div
                  onClick={() => setIsEmpty(v => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${isEmpty ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isEmpty ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-sm text-slate-600">
                  Pomieszczenie jest już puste
                  <span className="ml-1.5 text-slate-400 text-xs">{isEmpty ? "— pominę opróżnianie (~2× szybciej)" : "— najpierw usunę meble"}</span>
                </span>
              </label>
            </section>

            {/* Prawa kolumna — opcje + generuj */}
            <div className="flex flex-col gap-6">
              {/* Room type */}
              <section className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Typ pomieszczenia</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROOMS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoomType(r.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95
                        ${roomType === r.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="text-xs font-medium leading-tight text-center">{r.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Style */}
              <section className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Styl wnętrza</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95
                        ${style === s.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold ${style === s.id ? "text-white" : "text-slate-800"}`}>
                          {s.label}
                        </span>
                        <span className={`text-xs truncate ${style === s.id ? "text-slate-300" : "text-slate-500"}`}>
                          {s.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex flex-col gap-2">
                  <p>{error}</p>
                  {errorCode === "limit_reached" && (
                    <Link href="/pricing" className="text-blue-600 font-semibold hover:underline text-xs">
                      Kup wyższy plan →
                    </Link>
                  )}
                </div>
              )}

              {/* Generate */}
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={!imageBase64 || isGenerating}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98]
                    ${imageBase64 && !isGenerating
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Generowanie… (~30 sekund)
                    </span>
                  ) : (
                    "✨ Generuj wizualizację"
                  )}
                </button>
                {!imageBase64 && (
                  <p className="text-center text-sm text-slate-400">Najpierw dodaj zdjęcie pomieszczenia</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
