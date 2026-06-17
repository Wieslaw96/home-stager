"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanKey = "starter" | "growth" | "pro";
type Tab = "staging" | "history";
type Mode =
  | "staging" | "inspirational" | "prime_walls" | "remove_objects"
  | "wall_color" | "cabinet_color" | "remodel_kitchen" | "remodel_bathroom"
  | "upscale" | "sky_replace" | "landscaping" | "prompt_design";

interface HistoryEntry {
  id: string;
  mode: Mode;
  label: string;
  thumbnail: string;
  resultUrl: string;
  createdAt: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<PlanKey, string> = { starter: "Starter", growth: "Growth", pro: "Pro" };
const PLAN_LIMITS: Record<PlanKey, number | null> = { starter: 20, growth: 60, pro: null };

const MODES: { id: Mode; icon: string; label: string; desc: string; needsImage: boolean }[] = [
  { id: "staging",         icon: "🛋️", label: "Staging",       desc: "Umebluj styl AI",          needsImage: true },
  { id: "inspirational",   icon: "💡", label: "Inspiracje",     desc: "Generuj bez zdjęcia",       needsImage: false },
  { id: "remove_objects",  icon: "🧹", label: "Opróżnij",       desc: "Usuń meble",                needsImage: true },
  { id: "prime_walls",     icon: "🪣", label: "Oczyść ściany",  desc: "Dla pomieszczeń w remoncie — wygładza surowe, niemalowane ściany", needsImage: true },
  { id: "wall_color",      icon: "🎨", label: "Kolor ścian",    desc: "Przemaluj ściany",          needsImage: true },
  { id: "cabinet_color",   icon: "🚪", label: "Szafki",         desc: "Zmień kolor szafek",        needsImage: true },
  { id: "remodel_kitchen", icon: "🍳", label: "Kuchnia",        desc: "Przebuduj kuchnię",         needsImage: true },
  { id: "remodel_bathroom",icon: "🚿", label: "Łazienka",       desc: "Przebuduj łazienkę",        needsImage: true },
  { id: "upscale",         icon: "🔍", label: "Upscale",        desc: "Zwiększ rozdzielczość",     needsImage: true },
  { id: "sky_replace",     icon: "☁️", label: "Niebo",          desc: "Zmień niebo za domem",     needsImage: true },
  { id: "landscaping",     icon: "🌿", label: "Ogród",          desc: "Zaprojektuj ogród",         needsImage: true },
  { id: "prompt_design",   icon: "✍️", label: "Z opisu",        desc: "Opisz swoją wizję tekstem", needsImage: true },
];

const ROOMS: { id: string; label: string }[] = [
  { id: "living_room",    label: "Salon" },
  { id: "bedroom",        label: "Sypialnia" },
  { id: "kitchen",        label: "Kuchnia" },
  { id: "dining_room",    label: "Jadalnia" },
  { id: "bathroom",       label: "Łazienka" },
  { id: "home_office",    label: "Gabinet" },
  { id: "kids_room",      label: "Pokój dziecięcy" },
  { id: "family_room",    label: "Pokój rodzinny" },
  { id: "reading_nook",   label: "Kącik do czytania" },
  { id: "sunroom",        label: "Ogród zimowy" },
  { id: "walk_in_closet", label: "Garderoba" },
  { id: "mudroom",        label: "Przedsionek" },
  { id: "toy_room",       label: "Pokój zabaw" },
  { id: "foyer",          label: "Hol wejściowy" },
  { id: "powder_room",    label: "Toaleta" },
  { id: "laundry_room",   label: "Pralnia" },
  { id: "gym",            label: "Siłownia" },
  { id: "basement",       label: "Piwnica" },
  { id: "garage",         label: "Garaż" },
  { id: "balcony",        label: "Balkon" },
  { id: "home_bar",       label: "Bar domowy" },
  { id: "study_room",     label: "Biblioteka" },
  { id: "front_porch",    label: "Ganek przedni" },
  { id: "back_porch",     label: "Taras tylny" },
  { id: "back_patio",     label: "Patio" },
  { id: "open_plan",      label: "Open space" },
  { id: "boardroom",      label: "Sala konferencyjna" },
  { id: "meeting_room",   label: "Sala spotkań" },
  { id: "open_workspace", label: "Open workspace" },
  { id: "private_office", label: "Prywatne biuro" },
];

const STYLES: { id: string; label: string }[] = [
  { id: "modern",             label: "Modern" },
  { id: "minimalist",         label: "Minimalistyczny" },
  { id: "warmminimalist",     label: "Ciepły minimalizm" },
  { id: "scandinavian",       label: "Skandynawski" },
  { id: "japandi",            label: "Japandi" },
  { id: "wabi_sabi",          label: "Wabi-sabi" },
  { id: "industrial",         label: "Industrial" },
  { id: "industrialchic",     label: "Industrial chic" },
  { id: "boho",               label: "Boho" },
  { id: "eclectic",           label: "Eklektyczny" },
  { id: "maximalist",         label: "Maximalist" },
  { id: "contemporary",       label: "Contemporary" },
  { id: "transitional",       label: "Transitional" },
  { id: "traditional",        label: "Tradycyjny" },
  { id: "europeanclassic",    label: "Europejski klasyczny" },
  { id: "neotraditional",     label: "Neotraditional" },
  { id: "newtraditional",     label: "New traditional" },
  { id: "artdeco",            label: "Art Deco" },
  { id: "artnouveau",         label: "Art Nouveau" },
  { id: "bauhaus",            label: "Bauhaus" },
  { id: "midcenturymodern",   label: "Mid-century modern" },
  { id: "hollywoodregency",   label: "Hollywood Regency" },
  { id: "retrofuturism",      label: "Retrofuturyzm" },
  { id: "coastal",            label: "Nadmorski" },
  { id: "coastalgrandmother", label: "Coastal Grandmother" },
  { id: "tropical",           label: "Tropikalny" },
  { id: "mediterranean",      label: "Śródziemnomorski" },
  { id: "tuscan",             label: "Toskański" },
  { id: "farmhouse",          label: "Farmhouse" },
  { id: "modernfarmhouse",    label: "Modern Farmhouse" },
  { id: "rustic",             label: "Rustykalny" },
  { id: "country",            label: "Country" },
  { id: "frenchcountry",      label: "Francuski country" },
  { id: "shabbychic",         label: "Shabby Chic" },
  { id: "vintage",            label: "Vintage" },
  { id: "victorian",          label: "Wiktoriański" },
  { id: "gothic",             label: "Gotycki" },
  { id: "grandmillennial",    label: "Grandmillennial" },
  { id: "cottagecore",        label: "Cottagecore" },
  { id: "asian_zen",          label: "Azjatycki Zen" },
  { id: "moroccan",           label: "Marokański" },
  { id: "arabic",             label: "Arabski" },
  { id: "southwestern",       label: "Południowo-zachodni" },
  { id: "global",             label: "Global" },
  { id: "urbanmodern",        label: "Urban modern" },
  { id: "luxemodern",         label: "Luksusowy nowoczesny" },
  { id: "high_tech",          label: "High-tech" },
  { id: "organicmodern",      label: "Organiczny nowoczesny" },
  { id: "cabin",              label: "Chata / Cabin" },
  { id: "desertmodern",       label: "Desert modern" },
];

const COLOR_SCHEMES: { id: string; label: string }[] = [
  { id: "COLOR_SCHEME_0",  label: "Domyślny (brak preferencji)" },
  { id: "COLOR_SCHEME_1",  label: "Schemat 1 — Zieleń + Beż + Biel" },
  { id: "COLOR_SCHEME_2",  label: "Schemat 2 — Szary + Piasek + Niebieski" },
  { id: "COLOR_SCHEME_3",  label: "Schemat 3 — Brąz + Krem + Złoto" },
  { id: "COLOR_SCHEME_4",  label: "Schemat 4 — Antracyt + Biel + Drewno" },
  { id: "COLOR_SCHEME_5",  label: "Schemat 5 — Morski + Biały + Naturalny" },
  { id: "COLOR_SCHEME_6",  label: "Schemat 6 — Burgundy + Złoto + Kość słoniowa" },
  { id: "COLOR_SCHEME_7",  label: "Schemat 7 — Szałwia + Terakota + Ecru" },
  { id: "COLOR_SCHEME_8",  label: "Schemat 8 — Różowy + Nude + Zloty" },
  { id: "COLOR_SCHEME_9",  label: "Schemat 9 — Granat + Miedź + Szary" },
  { id: "COLOR_SCHEME_10", label: "Schemat 10 — Oliwka + Rdzawy + Biel" },
  { id: "COLOR_SCHEME_11", label: "Schemat 11 — Czarny + Złoty + Biały" },
  { id: "COLOR_SCHEME_12", label: "Schemat 12 — Turkus + Drewno + Piasek" },
  { id: "COLOR_SCHEME_13", label: "Schemat 13 — Lawendowy + Szary + Biel" },
  { id: "COLOR_SCHEME_14", label: "Schemat 14 — Morelowy + Brąz + Krem" },
  { id: "COLOR_SCHEME_15", label: "Schemat 15 — Zimny szary + Srebrny + Biel" },
  { id: "COLOR_SCHEME_16", label: "Schemat 16 — Szmaragd + Złoto + Krem" },
  { id: "COLOR_SCHEME_17", label: "Schemat 17 — Ceglasty + Naturalny + Ecru" },
  { id: "COLOR_SCHEME_18", label: "Schemat 18 — Chabrowy + Biel + Drewno" },
  { id: "COLOR_SCHEME_19", label: "Schemat 19 — Antyczne złoto + Ciemna zieleń" },
  { id: "COLOR_SCHEME_20", label: "Schemat 20 — Wielobarwny eklektyczny" },
];

const SPECIALITY_DECORS: { id: string; label: string }[] = [
  { id: "SPECIALITY_DECOR_0", label: "Brak (standardowe)" },
  { id: "SPECIALITY_DECOR_1", label: "Halloween" },
  { id: "SPECIALITY_DECOR_2", label: "Boże Narodzenie" },
  { id: "SPECIALITY_DECOR_3", label: "Thanksgiving" },
  { id: "SPECIALITY_DECOR_4", label: "Jesień" },
  { id: "SPECIALITY_DECOR_5", label: "Wiosna" },
  { id: "SPECIALITY_DECOR_6", label: "Lato" },
  { id: "SPECIALITY_DECOR_7", label: "Zima" },
];

const YARD_TYPES = ["Front Yard", "Backyard", "Side Yard"];
const GARDEN_STYLES = [
  "Garden", "Custom", "Shade Garden", "Herb and Vegetable garden",
  "California Style Garden", "Evergreen Garden", "Aquatic Garden",
  "Picturesque Garden", "New England Style Garden", "Colonial Style Garden",
  "Terraced Garden", "Bamboo Garden", "Patio Garden",
  "Pollinators-Friendly Garden", "Drought Resistant Garden", "Container Garden",
  "Tropical Garden", "Japanese Zen Garden", "Mediterranean Garden",
  "Rock Garden", "Private Courtyard Garden", "Outdoor Staircase Garden",
  "Mounds or Berms", "Therapeutic Garden", "Alpine Garden",
  "Feng Shui Garden", "Vertical Garden", "Chinese Garden",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HISTORY_KEY = "roomstager_history_v2";
const MAX_HISTORY = 20;

function resizeImage(file: File, maxPx = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
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
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}
function formatDate(ts: number) {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UploadZone({ preview, onFile }: { preview: string | null; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const handle = useCallback((f: File) => { if (f.type.startsWith("image/")) onFile(f); }, [onFile]);

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed aspect-[4/3] transition-all cursor-pointer select-none overflow-hidden
        ${dragging ? "border-[#C9A96E] bg-[#C9A96E]/5" : "border-white/10 bg-[#1a1a1a] hover:border-white/25 hover:bg-[#1f1f1f]"}`}
    >
      <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Podgląd" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-center p-3 bg-gradient-to-t from-black/40 to-transparent">
            <span className="text-white text-sm font-medium bg-black/30 px-3 py-1 rounded-full">Dotknij, aby zmienić</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/8 flex items-center justify-center text-3xl">📷</div>
          <div>
            <p className="font-semibold text-white/70">Dodaj zdjęcie</p>
            <p className="text-sm text-white/50 mt-1">Zrób zdjęcie lub wybierz z galerii</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultPanel({ original, result, onReset }: { original: string | null; result: string; onReset: () => void }) {
  const [tab, setTab] = useState<"before" | "after">("after");
  return (
    <div className="flex flex-col gap-4">
      {original && (
        <div className="md:hidden flex gap-2 p-1 bg-white/5 rounded-xl">
          {(["after", "before"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#2a2a2a] shadow text-white" : "text-white/40 hover:text-white/70"}`}>
              {t === "after" ? "✨ Po" : "📷 Przed"}
            </button>
          ))}
        </div>
      )}
      {original ? (
        <>
          <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tab === "after" ? result : original} alt={tab === "after" ? "Wynik" : "Oryginał"} className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:grid md:grid-cols-2 md:gap-4">
            {[{ src: original, lbl: "📷 Przed" }, { src: result, lbl: "✨ Po" }].map(({ src, lbl }) => (
              <div key={lbl} className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">{lbl}</p>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={lbl} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="Wynik" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex gap-2">
        <a href={result} download="result.jpg"
          className="flex-1 py-3 text-center rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a] font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all">
          Pobierz wynik
        </a>
        <button onClick={onReset}
          className="px-4 py-3 rounded-xl border border-white/10 text-white/50 font-semibold text-sm hover:bg-white/5 hover:text-white/70 active:scale-[0.98] transition-all">
          Nowe
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ entries, onDelete }: { entries: HistoryEntry[]; onDelete: (id: string) => void }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/6 flex items-center justify-center text-3xl">🖼️</div>
        <p className="font-semibold text-white/70">Brak wygenerowanych wizualizacji</p>
        <p className="text-sm text-white/40">Przejdź do zakładki Staging i wygeneruj pierwsze zdjęcie.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-white/40 text-right">{entries.length} / {MAX_HISTORY} wizualizacji</p>
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
        {entries.map((e) => (
          <div key={e.id} className="bg-[#161616] rounded-2xl border border-white/6 overflow-hidden">
            <div className="flex gap-3 p-3">
              <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white/6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.thumbnail && <img src={e.thumbnail} alt="Oryginał" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
              </div>
              <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white/6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.resultUrl} alt="Wynik" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <p className="font-semibold text-white/85 text-sm leading-tight truncate">{e.label}</p>
                  <p className="text-xs text-white/40 mt-1">{formatDate(e.createdAt)}</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <a href={e.resultUrl} download="result.jpg"
                    className="px-2.5 py-1.5 rounded-lg bg-[#C9A96E]/15 text-[#C9A96E] text-xs font-medium hover:bg-[#C9A96E]/25 border border-[#C9A96E]/20 transition-colors">
                    Pobierz
                  </a>
                  <button onClick={() => onDelete(e.id)}
                    className="ml-auto px-2.5 py-1.5 rounded-lg text-white/30 text-xs hover:text-red-400 hover:bg-red-950/30 transition-colors">
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

// ─── Select helpers ───────────────────────────────────────────────────────────

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white/70">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white/80 bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]">
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

const WALL_COLOR_PRESETS = [
  { hex: "#FFFFFF", name: "Biel" },
  { hex: "#F5F0E8", name: "Ciepła biel" },
  { hex: "#EDE0C4", name: "Krem" },
  { hex: "#D4B896", name: "Piasek" },
  { hex: "#D0CCCA", name: "Jasny szary" },
  { hex: "#B8B0A8", name: "Ciepły szary" },
  { hex: "#B2BFB0", name: "Szałwia" },
  { hex: "#A8BED0", name: "Błękit" },
  { hex: "#C8916A", name: "Terakota" },
  { hex: "#484848", name: "Antracyt" },
];

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-white/70">{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {WALL_COLOR_PRESETS.map((c) => (
          <button
            key={c.hex}
            title={c.name}
            onClick={() => onChange(c.hex)}
            className={`h-9 rounded-lg border-2 transition-all ${
              value.toUpperCase() === c.hex ? "border-[#C9A96E] scale-110 shadow-md shadow-[#C9A96E]/20" : "border-white/10 hover:border-white/25"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      <div className="flex gap-3 items-center mt-1">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-white/8 cursor-pointer p-0.5 bg-[#1a1a1a]" />
        <span className="font-mono text-xs text-white/50">Niestandardowy kolor</span>
        <span className="font-mono text-sm text-white/70 bg-white/6 px-2 py-1 rounded-lg ml-auto">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

function ToggleGroup({ label, options, value, onChange }: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white/70">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${value === o.id ? "border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]" : "border-white/8 text-white/60 hover:border-white/20 hover:bg-white/5"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("staging");
  const [mode, setMode] = useState<Mode>("staging");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Mode-specific form state
  const [roomType, setRoomType] = useState("living_room");
  const [style, setStyle] = useState("modern");
  const [colorScheme, setColorScheme] = useState("COLOR_SCHEME_0");
  const [specialityDecor, setSpecialityDecor] = useState("SPECIALITY_DECOR_0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wallColor, setWallColor] = useState("#FFFFFF");
  const [cabinetColor, setCabinetColor] = useState("#FFFFFF");
  const [designPrompt, setDesignPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [skyType, setSkyType] = useState("day");
  const [scaleFactor, setScaleFactor] = useState(2);
  const [renderType, setRenderType] = useState("perspective");
  const [yardType, setYardType] = useState("Backyard");
  const [gardenStyle, setGardenStyle] = useState("Garden");

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // User state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<PlanKey | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    setHistory(loadHistory());
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserEmail(user.email ?? null);
      const d = new Date();
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const [{ data: sub }, { data: usage }] = await Promise.all([
        supabase.from("subscriptions").select("plan").eq("user_id", user.id).eq("status", "active").maybeSingle(),
        supabase.from("usage").select("count").eq("user_id", user.id).eq("year_month", ym).maybeSingle(),
      ]);
      setUserPlan((sub?.plan as PlanKey) ?? null);
      setUsageCount(usage?.count ?? 0);
    });
  }, []);

  const toggleListening = useCallback(() => {
    const SR = (typeof window !== "undefined")
      ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
      : undefined;

    if (!SR) { alert("Twoja przeglądarka nie obsługuje dyktowania. Użyj Chrome lub Edge."); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = "pl-PL";
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .slice(e.resultIndex)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setDesignPrompt((prev) => (prev ? prev + " " + transcript : transcript).trim());
    };

    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  const handleFile = useCallback(async (file: File) => {
    setResult(null); setError(null);
    const dataUri = await resizeImage(file);
    setImagePreview(dataUri);
    setImageBase64(dataUri);
  }, []);

  const currentMode = MODES.find((m) => m.id === mode)!;

  const buildLabel = () => {
    const modeLabel = currentMode.label;
    switch (mode) {
      case "staging":
      case "inspirational":
      case "remodel_kitchen":
      case "remodel_bathroom": {
        const r = ROOMS.find((r) => r.id === roomType);
        const s = STYLES.find((s) => s.id === style);
        return `${modeLabel} — ${s?.label ?? style}${r ? ` / ${r.label}` : ""}`;
      }
      case "prompt_design": return `${modeLabel} — ${designPrompt.slice(0, 40) || "brak opisu"}`;
      case "wall_color":    return `${modeLabel} — ${wallColor.toUpperCase()}`;
      case "cabinet_color": return `${modeLabel} — ${cabinetColor.toUpperCase()}`;
      case "sky_replace":   return `${modeLabel} — ${skyType}`;
      case "landscaping":   return `${modeLabel} — ${gardenStyle} / ${yardType}`;
      case "upscale":       return `${modeLabel} — ${scaleFactor}×`;
      default:              return modeLabel;
    }
  };

  const handleGenerate = async () => {
    if (currentMode.needsImage && !imageBase64) return;
    setIsGenerating(true); setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode, imageBase64,
          roomType, style, colorScheme, specialityDecor,
          wallColor, cabinetColor, skyType,
          scaleFactor, renderType, yardType, gardenStyle,
          designPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorCode(data.code ?? null);
        if (data.code === "no_subscription") { router.push("/pricing"); return; }
        throw new Error(data.error ?? "Nieznany błąd");
      }
      setErrorCode(null);
      setUsageCount((c) => c + 1);
      setResult(data.imageUrl);

      const thumbnail = imageBase64 ? await makeThumbnail(imageBase64) : "";
      const entry: HistoryEntry = {
        id: crypto.randomUUID(), mode, label: buildLabel(),
        thumbnail, resultUrl: data.imageUrl, createdAt: Date.now(),
      };
      const updated = [entry, ...history];
      setHistory(updated); saveHistory(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => { setResult(null); setImagePreview(null); setImageBase64(null); setError(null); setErrorCode(null); };

  const canGenerate = isGenerating ? false : currentMode.needsImage ? !!imageBase64 : true;

  return (
    <div className="min-h-svh bg-[#0f0f0f]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#161616] border-b border-white/6 backdrop-blur-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#A07840] flex items-center justify-center text-sm">🏠</div>
          <div>
            <h1 className="font-bold text-white leading-none">RoomStager</h1>
            <p className="text-xs text-white/50">AI Virtual Staging</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {userPlan && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
                <span className="bg-[#C9A96E]/15 text-[#C9A96E] font-semibold px-2 py-0.5 rounded-full">{PLAN_LABELS[userPlan]}</span>
                {PLAN_LIMITS[userPlan] !== null && <span>{usageCount}/{PLAN_LIMITS[userPlan]} gen.</span>}
              </div>
            )}
            {userEmail && (
              <button onClick={async () => { await createClient().auth.signOut(); router.push("/login"); }}
                className="text-xs text-white/40 hover:text-white/60 transition-colors px-2 py-1 rounded-lg hover:bg-white/6">
                Wyloguj
              </button>
            )}
          </div>
        </div>
        <div className="flex border-t border-white/6">
          {(["staging", "history"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${tab === t ? "text-white" : "text-white/40 hover:text-white/60"}`}>
              {t === "staging" ? "Staging" : `Historia${history.length > 0 ? ` (${history.length})` : ""}`}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A96E] rounded-full" />}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "history" ? (
          <HistoryPanel entries={history} onDelete={(id) => {
            const updated = history.filter((e) => e.id !== id);
            setHistory(updated); saveHistory(updated);
          }} />
        ) : result ? (
          <ResultPanel original={imagePreview} result={result} onReset={reset} />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Mode selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/70">Tryb</label>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                {MODES.map((m) => (
                  <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setError(null); }}
                    className={`flex-shrink-0 snap-start flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border-2 text-center transition-all min-w-[72px]
                      ${mode === m.id ? "border-[#C9A96E] bg-[#C9A96E]/10 text-white" : "border-white/8 bg-[#1a1a1a] text-white/60 hover:border-white/20 hover:bg-white/5"}`}>
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs font-medium leading-tight whitespace-nowrap">{m.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/40">{currentMode.desc}</p>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8 flex flex-col gap-6">
              {/* Left column — upload */}
              {currentMode.needsImage && (
                <section className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/70">Zdjęcie</label>
                  <UploadZone preview={imagePreview} onFile={handleFile} />
                </section>
              )}

              {/* Right column — options */}
              <div className={`flex flex-col gap-5 ${!currentMode.needsImage ? "md:col-span-2 max-w-lg" : ""}`}>

                {/* staging & inspirational */}
                {(mode === "staging" || mode === "inspirational") && (
                  <>
                    <Select label="Typ pomieszczenia" value={roomType} onChange={setRoomType} options={ROOMS} />
                    <Select label="Styl wnętrza" value={style} onChange={setStyle} options={STYLES} />
                  </>
                )}

                {/* remodel kitchen/bathroom */}
                {(mode === "remodel_kitchen" || mode === "remodel_bathroom") && (
                  <Select label="Styl" value={style} onChange={setStyle} options={STYLES} />
                )}

                {/* prompt_design */}
                {mode === "prompt_design" && (
                  <>
                    <Select label="Typ pomieszczenia" value={roomType} onChange={setRoomType} options={ROOMS} />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white/70">Opis wizji</label>
                        <button
                          type="button"
                          onClick={toggleListening}
                          title={isListening ? "Zatrzymaj dyktowanie" : "Dyktuj przez mikrofon"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isListening
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-white/5 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                          </svg>
                          {isListening ? "Słucham..." : "Dyktuj"}
                        </button>
                      </div>
                      <textarea
                        value={designPrompt}
                        onChange={(e) => setDesignPrompt(e.target.value)}
                        placeholder="np. nowoczesny salon z dużymi oknami, ciemne drewno, szare akcenty, rośliny..."
                        rows={4}
                        className={`w-full rounded-xl border bg-[#1a1a1a] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 resize-none transition-all ${
                          isListening ? "border-red-500/50 focus:ring-red-500/20" : "border-white/8 focus:ring-white/20"
                        }`}
                      />
                      <p className="text-xs text-white/40">Opisz styl, kolory, meble i nastrój który chcesz uzyskać. Możesz dyktować lub pisać.</p>
                    </div>
                  </>
                )}

                {/* wall color */}
                {mode === "wall_color" && (
                  <ColorInput label="Kolor ściany" value={wallColor} onChange={setWallColor} />
                )}

                {/* cabinet color */}
                {mode === "cabinet_color" && (
                  <ColorInput label="Kolor szafek" value={cabinetColor} onChange={setCabinetColor} />
                )}

                {/* sky replace */}
                {mode === "sky_replace" && (
                  <ToggleGroup label="Pora dnia" value={skyType} onChange={setSkyType}
                    options={[{ id: "day", label: "Dzień" }, { id: "dusk", label: "Zmierzch" }, { id: "night", label: "Noc" }]} />
                )}

                {/* upscale */}
                {mode === "upscale" && (
                  <ToggleGroup label="Skala powiększenia" value={String(scaleFactor)} onChange={(v) => setScaleFactor(Number(v))}
                    options={[
                      { id: "2", label: "2×" }, { id: "3", label: "3× (+$0.20)" },
                      { id: "4", label: "4× (+$0.20)" }, { id: "6", label: "6× (+$0.40)" }, { id: "8", label: "8× (+$0.60)" },
                    ]} />
                )}

                {/* landscaping */}
                {mode === "landscaping" && (
                  <>
                    <ToggleGroup label="Typ ogrodu" value={yardType} onChange={setYardType}
                      options={YARD_TYPES.map((y) => ({ id: y, label: y }))} />
                    <Select label="Styl ogrodu" value={gardenStyle} onChange={setGardenStyle}
                      options={GARDEN_STYLES.map((g) => ({ id: g, label: g }))} />
                  </>
                )}

                {/* Advanced options */}
                {["staging", "inspirational", "remodel_kitchen", "remodel_bathroom"].includes(mode) && (
                  <div className="border border-white/8 rounded-2xl overflow-hidden">
                    <button onClick={() => setShowAdvanced((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors">
                      <span>Opcje zaawansowane</span>
                      <span className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}>▾</span>
                    </button>
                    {showAdvanced && (
                      <div className="px-4 pb-4 flex flex-col gap-4 border-t border-white/6 pt-4">
                        <Select label="Schemat kolorów" value={colorScheme} onChange={setColorScheme} options={COLOR_SCHEMES} />
                        <Select label="Dekoracje sezonowe" value={specialityDecor} onChange={setSpecialityDecor} options={SPECIALITY_DECORS} />
                      </div>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm flex flex-col gap-2">
                    <p>{error}</p>
                    {errorCode === "limit_reached" && (
                      <Link href="/pricing" className="text-[#C9A96E] font-semibold hover:underline text-xs">Kup wyższy plan →</Link>
                    )}
                  </div>
                )}

                {/* Generate */}
                <button onClick={handleGenerate} disabled={!canGenerate}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98]
                    ${canGenerate ? "bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a] hover:opacity-90 shadow-lg shadow-[#C9A96E]/25" : "bg-white/6 text-white/20 cursor-not-allowed"}`}>
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Generowanie…
                    </span>
                  ) : `${currentMode.icon} Generuj`}
                </button>

                {currentMode.needsImage && !imageBase64 && (
                  <p className="text-center text-sm text-white/40">Najpierw dodaj zdjęcie</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
