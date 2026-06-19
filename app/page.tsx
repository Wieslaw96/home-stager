import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Stageria — Wirtualny Staging AI dla Profesjonalistów",
  description:
    "Zamień puste pokoje w zachwycające wnętrza w 30 sekund. Profesjonalny wirtualny staging AI dla agentów nieruchomości i deweloperów.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "3×", label: "więcej zapytań od kupujących" },
  { value: "15%", label: "wyższa cena sprzedaży" },
  { value: "30s", label: "czas generowania zdjęcia" },
];

const PAIN_POINTS = [
  { icon: "💸", title: "3 000 – 8 000 zł", desc: "Tyle kosztuje tradycyjny home staging za jedno mieszkanie. Każde." },
  { icon: "🗓️", title: "2–3 tygodnie", desc: "Tyle czekasz na koordynację ekipy, transport mebli i zwolnienie terminu." },
  { icon: "📉", title: "37% mniej zapytań", desc: "Tyle tracisz publikując zdjęcia pustych pomieszczeń zamiast umeblowanych." },
  { icon: "😤", title: "Logistyka i ryzyko", desc: "Zniszczone meble, nieterminowi wykonawcy, stres przed każdym pokazem." },
];

const STEPS = [
  { num: "01", title: "Wgraj zdjęcie", desc: "Wystarczy zwykłe zdjęcie telefonem. Puste pokoje, pomieszczenia w remoncie — wszystko działa." },
  { num: "02", title: "Wybierz styl", desc: "30 typów pomieszczeń, 51 stylów wnętrz, 11 narzędzi AI. Jedno kliknięcie." },
  { num: "03", title: "Pobierz i publikuj", desc: "Profesjonalne zdjęcie gotowe w 30 sekund. Prosto do ogłoszenia." },
];

const FEATURES = [
  { icon: "🛋️", label: "Staging wnętrz", desc: "Umeblujesz puste pokoje w dowolnym stylu" },
  { icon: "🧹", label: "Opróżnianie pomieszczeń", desc: "Usuwasz meble i bałagan ze zdjęcia" },
  { icon: "🎨", label: "Zmiana koloru ścian", desc: "Prezentujesz różne warianty kolorystyczne" },
  { icon: "🍳", label: "Remont kuchni", desc: "Wizualizujesz nową kuchnię bez budowlańców" },
  { icon: "🚿", label: "Remont łazienki", desc: "Pokazujesz potencjał łazienki w remoncie" },
  { icon: "🚪", label: "Kolor szafek", desc: "Odświeżasz kuchnię zmianą koloru frontów" },
  { icon: "🌿", label: "Projekt ogrodu", desc: "Prezentujesz zagospodarowanie przestrzeni" },
  { icon: "☁️", label: "Podmiana nieba", desc: "Zmieniasz szare niebo na błękitne lub zachód" },
  { icon: "🔍", label: "Upscaling", desc: "Powiększasz i wyostrzasz zdjęcia do druku" },
  { icon: "🪣", label: "Czyszczenie ścian", desc: "Wygładzasz surowe ściany w remoncie" },
  { icon: "✍️", label: "Staging z opisu", desc: "Opisujesz wizję tekstem, AI ją realizuje" },
  { icon: "💡", label: "Inspiracje", desc: "Generujesz projekty wnętrz bez własnego zdjęcia" },
];

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "97",
    gen: "20",
    perGen: "4,85 zł / zdjęcie",
    saving: null,
    features: ["20 generacji / mies. (~4 ogłoszenia)", "Geometria pokoju zachowana w 100%", "Wszystkie style wnętrz", "Wszystkie typy pomieszczeń", "Pobieranie wyników"],
    highlight: false,
    cta: "Wybierz Starter",
  },
  {
    key: "agent",
    name: "Agent",
    price: "247",
    gen: "80",
    perGen: "3,09 zł / zdjęcie",
    saving: "36% taniej niż Starter",
    features: ["80 generacji / mies. (~16 ogłoszeń)", "Geometria pokoju zachowana w 100%", "Wszystkie style wnętrz", "Wszystkie typy pomieszczeń", "Pobieranie wyników", "Priorytetowa kolejka"],
    highlight: true,
    cta: "Wybierz Agent",
  },
  {
    key: "agencja",
    name: "Agencja",
    price: "597",
    gen: "300",
    perGen: "1,99 zł / zdjęcie",
    saving: "59% taniej niż Starter",
    features: ["300 generacji / mies. (~60 ogłoszeń)", "3 konta w planie", "Geometria pokoju zachowana w 100%", "Wszystkie style wnętrz", "Wszystkie typy pomieszczeń", "Priorytetowe wsparcie"],
    highlight: false,
    cta: "Wybierz Agencja",
  },
];

const FAQS = [
  {
    q: "Czy potrzebuję profesjonalnych zdjęć?",
    a: "Nie. Zdjęcie telefonem w zupełności wystarczy. AI radzi sobie nawet ze słabym oświetleniem i kątami.",
  },
  {
    q: "Czym różnicie się od darmowych generatorów AI jak Google?",
    a: "Darmowe generatory tworzą inspirację, nie materiał do ogłoszenia — przesuwają ściany, znikają okna, drzwi lądują w przypadkowych miejscach. Stageria jest trenowana specjalnie na architekturę wnętrz i zachowuje strukturę pokoju w 100%. Wynik nadaje się prosto do ogłoszenia, bez retuszu.",
  },
  {
    q: "Jak szybko dostaję wynik?",
    a: "Zazwyczaj 20–40 sekund. W godzinach szczytu do 2 minut. Możesz generować kilka zdjęć jednocześnie.",
  },
  {
    q: "Czy mogę anulować subskrypcję w dowolnym momencie?",
    a: "Tak. Bez zobowiązań, bez ukrytych opłat. Anulujesz jednym kliknięciem w panelu.",
  },
  {
    q: "Czy zdjęcia nadają się do publikacji w ogłoszeniach?",
    a: "Tak. Wyniki mają jakość profesjonalnych fotografii i spełniają wymagania wszystkich portali nieruchomości.",
  },
  {
    q: "Czy mogę użyć Stagerii dla każdego rodzaju nieruchomości?",
    a: "Tak — obsługujemy 30 typów pomieszczeń: mieszkania, domy, biura, powierzchnie komercyjne, ogrody i elewacje.",
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

function GoldButton({ href, children, large }: { href: string; children: React.ReactNode; large?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a] shadow-lg shadow-[#C9A96E]/20 ${
        large ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
      }`}
    >
      {children}
    </Link>
  );
}

function OutlineButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center font-semibold rounded-xl border border-white/20 text-white px-6 py-3 text-sm transition-all duration-200 hover:bg-white/5 hover:border-white/40"
    >
      {children}
    </Link>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C9A96E] mb-4">
      {children}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body    { font-family: 'Inter', system-ui, sans-serif; }
        .gold-gradient { background: linear-gradient(135deg, #C9A96E 0%, #E8D5A3 50%, #C9A96E 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-glow:hover { box-shadow: 0 0 40px rgba(201, 169, 110, 0.08); }
        .noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); }
      `}</style>

      <div className="font-body bg-[#080808] text-white min-h-screen noise">

        {/* ── NAV ───────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg">
                Zaloguj się
              </Link>
              <GoldButton href="/pricing">Sprawdź plany</GoldButton>
            </div>
          </div>
        </nav>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative pt-8 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C9A96E]/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A96E]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 border border-[#C9A96E]/30 rounded-full px-4 py-1.5 text-xs text-[#C9A96E] font-semibold mb-8 bg-[#C9A96E]/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-pulse" />
              Narzędzie dla profesjonalnych agentów nieruchomości
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05] mb-6">
              Twoje ogłoszenia<br />
              <span className="gold-gradient">zasługują na więcej</span><br />
              niż puste pokoje
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Profesjonalny wirtualny staging AI w 30 sekund. Bez ekipy, bez logistyki,
              bez tygodni czekania. Tylko wynik, który sprzedaje.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <GoldButton href="#plans" large>
                Zacznij teraz — od 97 zł / mies.
              </GoldButton>
              <OutlineButton href="#demo">
                ▶ Obejrzyj jak to działa
              </OutlineButton>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 text-white/60 text-sm">
              <span className="flex items-center gap-1.5"><span className="text-[#C9A96E]">✓</span> Okna i drzwi zachowane dokładnie jak w oryginale</span>
              <span className="flex items-center gap-1.5"><span className="text-[#C9A96E]">✓</span> Gotowe do publikacji w ogłoszeniu</span>
              <span className="flex items-center gap-1.5"><span className="text-[#C9A96E]">✓</span> Nie generator — narzędzie profesjonalne</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
              {STATS.map((s) => (
                <div key={s.value} className="text-center">
                  <div className="font-display text-3xl md:text-4xl font-black gold-gradient mb-1">{s.value}</div>
                  <div className="text-white/40 text-xs leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VIDEO DEMO ────────────────────────────────────────────────── */}
        <section id="demo" className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-[#111111] aspect-video flex items-center justify-center group">
              {/* TODO: Podmień na właściwe wideo — np. <video src="/demo.mp4" controls poster="/demo-thumbnail.jpg" className="w-full h-full object-cover" /> */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A96E]/10 to-transparent" />
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white/40 text-sm">Demo wideo — wkrótce</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-white/10 rounded-full">
                  <div className="h-full w-0 bg-[#C9A96E] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM ───────────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionTag>Problem</SectionTag>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Ile kosztuje Cię <span className="gold-gradient">pusty pokój?</span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Tradycyjny home staging to procedura z lat 90. Rynek poszedł dalej. Twoja konkurencja też.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PAIN_POINTS.map((p) => (
                <div key={p.title} className="card-glow bg-[#111111] border border-white/6 rounded-2xl p-6 transition-all duration-300">
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="font-display font-bold text-xl mb-2 text-white">{p.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <SectionTag>Rozwiązanie</SectionTag>
              <h2 className="font-display text-3xl md:text-5xl font-bold">
                Stary sposób vs. <span className="gold-gradient">Stageria</span>
              </h2>
            </div>

            {/* Desktop: 3-column table */}
            <div className="hidden sm:block rounded-2xl border border-white/8 overflow-hidden">
              <div className="grid grid-cols-3 bg-[#111111]">
                <div className="p-4 text-white/30 text-sm font-semibold" />
                <div className="p-4 text-center text-white/40 text-sm font-semibold border-x border-white/6">Inne rozwiązania</div>
                <div className="p-4 text-center text-sm font-semibold">
                  <span className="gold-gradient font-bold">Stageria</span>
                </div>
              </div>
              {[
                ["Koszt", "3 000 – 8 000 zł", "od 97 zł / mies."],
                ["Czas realizacji", "2–3 tygodnie", "30 sekund"],
                ["Liczba zdjęć", "Ograniczona", "Nielimitowana (Pro)"],
                ["Zmiany stylów", "Nowe zlecenie = nowy koszt", "Kliknięcie"],
                ["Geometria pokoju", "Zniekształcona przez AI", "Zachowana w 100%"],
                ["Ryzyko", "Logistyka, transport, zniszczenia", "Żadne"],
                ["Dostępność", "W godzinach roboczych", "24/7, z każdego miejsca"],
              ].map(([label, traditional, ours], i) => (
                <div key={label} className={`grid grid-cols-3 border-t border-white/6 ${i % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111111]"}`}>
                  <div className="p-4 text-sm text-white/60 font-medium">{label}</div>
                  <div className="p-4 text-center text-sm text-white/30 border-x border-white/6">{traditional}</div>
                  <div className="p-4 text-center text-sm text-[#C9A96E] font-semibold">{ours}</div>
                </div>
              ))}
            </div>

            {/* Mobile: stacked cards */}
            <div className="sm:hidden flex flex-col gap-3">
              {[
                ["Koszt", "3 000 – 8 000 zł", "od 97 zł / mies."],
                ["Czas realizacji", "2–3 tygodnie", "30 sekund"],
                ["Liczba zdjęć", "Ograniczona", "Nielimitowana (Pro)"],
                ["Zmiany stylów", "Nowe zlecenie = nowy koszt", "Kliknięcie"],
                ["Geometria pokoju", "Zniekształcona przez AI", "Zachowana w 100%"],
                ["Ryzyko", "Logistyka, transport, zniszczenia", "Żadne"],
                ["Dostępność", "W godzinach roboczych", "24/7, z każdego miejsca"],
              ].map(([label, traditional, ours]) => (
                <div key={label} className="rounded-xl border border-white/8 overflow-hidden">
                  <div className="px-4 py-2 bg-[#111111] text-xs font-bold text-white/50 uppercase tracking-wider">{label}</div>
                  <div className="grid grid-cols-2 divide-x divide-white/6">
                    <div className="px-4 py-3 bg-[#0d0d0d]">
                      <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wide mb-1">Tradycyjny</p>
                      <p className="text-sm text-white/40 line-through">{traditional}</p>
                    </div>
                    <div className="px-4 py-3 bg-[#0d0d0d]">
                      <p className="text-[10px] text-[#C9A96E]/60 font-semibold uppercase tracking-wide mb-1">Stageria</p>
                      <p className="text-sm text-[#C9A96E] font-semibold">{ours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER ────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionTag>Efekty</SectionTag>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Różnica, którą <span className="gold-gradient">widzą kupujący</span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Każde zdjęcie poniżej zostało wygenerowane przez Stagerię w mniej niż 40 sekund.
              </p>
            </div>

            {/* TODO: Podmień src na właściwe zdjęcia before/after */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: "Salon — styl nowoczesny", beforeSrc: "/before-1.jpg", afterSrc: "/after-1.jpg" },
                { label: "Sypialnia — styl skandynawski", beforeSrc: "/before-2.jpg", afterSrc: "/after-2.jpg" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl overflow-hidden border border-white/8 bg-[#111111]">
                  <div className="grid grid-cols-2 divide-x divide-white/8">
                    <div className="aspect-[4/3] bg-[#1a1a1a] flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-3xl mb-2">📷</div>
                        <div className="text-white/30 text-xs">Zdjęcie oryginalne</div>
                      </div>
                    </div>
                    <div className="aspect-[4/3] bg-gradient-to-br from-[#C9A96E]/10 to-[#1a1a1a] flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-3xl mb-2">✨</div>
                        <div className="text-[#C9A96E] text-xs font-semibold">Po stagingu AI</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-white/6">
                    <p className="text-white/50 text-xs">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-white/30 text-xs mt-6">
              Własne zdjęcia before/after pojawią się tutaj wkrótce
            </p>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <SectionTag>Jak to działa</SectionTag>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Trzy kroki do <span className="gold-gradient">zdjęcia, które sprzedaje</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="font-display text-6xl font-black gold-gradient opacity-30 mb-4 leading-none">{step.num}</div>
                  <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <SectionTag>Funkcje</SectionTag>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                12 narzędzi AI <span className="gold-gradient">w jednym miejscu</span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Inne platformy oferują jedno. My oferujemy kompletny zestaw narzędzi dla agenta, który chce wygrywać.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.label} className="card-glow flex items-start gap-4 bg-[#111111] border border-white/6 rounded-xl p-5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center text-xl flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{f.label}</h3>
                    <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXCLUSIVITY / POSITIONING ─────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl border border-[#C9A96E]/20 bg-gradient-to-br from-[#C9A96E]/8 via-[#111111] to-[#111111] p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A96E]/5 to-transparent pointer-events-none" />
              <div className="relative">
                <SectionTag>Dla kogo</SectionTag>
                <h2 className="font-display text-3xl md:text-5xl font-black mb-6">
                  Platforma dla wymagających<br />
                  <span className="gold-gradient">profesjonalistów</span>
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                  Nasz klient to agent, który rozumie, że pierwsze wrażenie decyduje o sprzedaży.
                  Deweloper, który wie, że staging to inwestycja, nie koszt.
                  Inwestor, który liczy zwrot — i go otrzymuje.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
                  {[
                    { title: "Pośrednicy", desc: "Wyprzedzasz konkurencję w każdym ogłoszeniu." },
                    { title: "Deweloperzy", desc: "Prezentujesz lokale na etapie budowy." },
                    { title: "Inwestorzy", desc: "Maksymalizujesz wartość każdego flipa." },
                  ].map((item) => (
                    <div key={item.title} className="bg-white/5 rounded-xl p-4 border border-white/8">
                      <h4 className="font-semibold text-sm mb-1 text-[#C9A96E]">{item.title}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────── */}
        <section id="pricing" className="px-6 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-5">
              <SectionTag>Cennik</SectionTag>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Mniej niż koszt <span className="gold-gradient">jednego zdjęcia fotografa</span>
              </h2>
            </div>

            {/* Anchoring — traditional staging cost */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-red-950/40 border border-red-900/30 rounded-xl px-6 py-3">
                <span className="text-red-400 text-sm">Tradycyjny staging:</span>
                <span className="text-white/50 line-through text-lg font-display font-bold">3 000 – 8 000 zł</span>
                <span className="text-red-400 text-xs">za jedną sesję</span>
              </div>
            </div>

            <div id="plans" className="grid md:grid-cols-3 gap-6 items-stretch scroll-mt-20">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                    plan.highlight
                      ? "border-[#C9A96E]/40 bg-gradient-to-b from-[#C9A96E]/10 to-[#111111] shadow-xl shadow-[#C9A96E]/10"
                      : "border-white/8 bg-[#111111]"
                  }`}
                >
                  {plan.highlight && (
                    <div className="text-center mb-4">
                      <span className="bg-[#C9A96E] text-[#0a0a0a] text-xs font-black px-3 py-1 rounded-full tracking-wide uppercase">
                        Najpopularniejszy
                      </span>
                    </div>
                  )}
                  <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                  <div className="mb-1">
                    <span className="font-display text-4xl font-black">{plan.price} zł</span>
                    <span className="text-white/40 text-sm"> / miesiąc</span>
                  </div>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="text-xs text-white/40">{plan.perGen}</span>
                    {plan.saving && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        ↓ {plan.saving}
                      </span>
                    )}
                  </div>

                  <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                        <span className="text-[#C9A96E] mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/api/checkout/${plan.key}`}
                    className={`block w-full rounded-xl py-3 text-sm font-semibold text-center transition-all duration-200 hover:scale-[1.02] ${
                      plan.highlight
                        ? "bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a]"
                        : "bg-white/8 text-white hover:bg-white/12 border border-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-white/30 text-xs mt-6">
              Anuluj w dowolnym momencie. Bez ukrytych opłat. Faktura VAT w cenie.
            </p>
          </div>
        </section>

        {/* ── TESTIMONIALS (placeholder) ────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <SectionTag>Opinie</SectionTag>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Co mówią <span className="gold-gradient">nasi klienci</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { text: "Stageria skróciła czas przygotowania ogłoszenia z 2 tygodni do jednego dnia. Kupujący pytają o mieszkania, które wyglądają jak z magazynu.", name: "Marek K.", role: "Agent nieruchomości, Warszawa" },
                { text: "Używam tego narzędzia przy każdym flipie. Zwrot inwestycji jest natychmiastowy — staging za 99 zł sprzedaje mieszkanie o 10 000 zł drożej.", name: "Joanna W.", role: "Inwestorka, Kraków" },
                { text: "Moi klienci są zachwyceni, że mogę im pokazać jak będzie wyglądało mieszkanie jeszcze przed remontem. To przewaga, której nie ma moja konkurencja.", name: "Tomasz P.", role: "Pośrednik, Wrocław" },
              ].map((t) => (
                <div key={t.name} className="card-glow bg-[#111111] border border-white/6 rounded-2xl p-6 flex flex-col transition-all duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#C9A96E]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed flex-1 mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/30 text-xs">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <SectionTag>FAQ</SectionTag>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Najczęstsze pytania</h2>
            </div>
            <div className="flex flex-col divide-y divide-white/6">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group py-5 cursor-pointer">
                  <summary className="flex items-center justify-between list-none text-sm font-semibold text-white hover:text-[#C9A96E] transition-colors select-none">
                    {faq.q}
                    <span className="ml-4 flex-shrink-0 text-white/30 group-open:text-[#C9A96E] transition-colors">
                      <svg className="w-5 h-5 transition-transform duration-200 group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-3xl border border-[#C9A96E]/20 bg-gradient-to-br from-[#C9A96E]/8 to-[#111111] p-12 md:p-20 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#C9A96E]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative">
                <h2 className="font-display text-3xl md:text-5xl font-black mb-5">
                  Dołącz do grona agentów,<br />
                  którzy <span className="gold-gradient">sprzedają szybciej</span>
                </h2>
                <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                  Pierwsze zdjęcie wygenerujesz w mniej niż 2 minuty od rejestracji.
                  Anuluj w dowolnym momencie.
                </p>
                <GoldButton href="/pricing" large>
                  Zacznij teraz — od 97 zł / mies. →
                </GoldButton>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/6 px-6 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-xs text-white/30">
              <Link href="/pricing" className="hover:text-white/60 transition-colors">Cennik</Link>
              <Link href="/login" className="hover:text-white/60 transition-colors">Zaloguj się</Link>
              <Link href="/register" className="hover:text-white/60 transition-colors">Zarejestruj się</Link>
              <Link href="/regulamin" className="hover:text-white/60 transition-colors">Regulamin</Link>
              <Link href="/polityka-prywatnosci" className="hover:text-white/60 transition-colors">Polityka prywatności</Link>
            </div>
            <p className="text-white/20 text-xs">© 2026 Stageria. Wszelkie prawa zastrzeżone.</p>
          </div>
        </footer>

      </div>
    </>
  );
}
