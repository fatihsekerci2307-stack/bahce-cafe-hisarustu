"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type HookahType = "meyveli" | "klasik";

interface FlavorOption {
  id: string;
  emoji: string;
  name: string;
  /** Orb arka planı için Tailwind gradient sınıfları (görsel yoksa kullanılır) */
  color: string;
  /** İleride gerçek ürün görseli eklenirse buraya URL konur; şimdilik boş */
  image?: string;
}

const FLAVORS: Record<HookahType, FlavorOption[]> = {
  meyveli: [
    { id: "elma", emoji: "🍏", name: "Elma", color: "from-lime-400 to-green-600" },
    { id: "uzum-nane", emoji: "🍇", name: "Üzüm Nane", color: "from-purple-400 to-purple-700" },
    { id: "karpuz", emoji: "🍉", name: "Karpuz", color: "from-red-400 to-pink-600" },
    { id: "seftali", emoji: "🍑", name: "Şeftali", color: "from-orange-300 to-orange-500" },
    { id: "cift-elma", emoji: "🍏", name: "Çift Elma", color: "from-emerald-400 to-teal-600" },
    { id: "limon-nane", emoji: "🍋", name: "Limon Nane", color: "from-yellow-300 to-lime-500" },
  ],
  klasik: [
    { id: "double-apple", emoji: "🍎", name: "Double Apple", color: "from-red-500 to-red-800" },
    { id: "damla-sakiz", emoji: "🍬", name: "Damla Sakız", color: "from-teal-300 to-cyan-600" },
    { id: "cappuccino", emoji: "☕", name: "Cappuccino", color: "from-amber-600 to-yellow-900" },
    { id: "nane", emoji: "🌿", name: "Nane", color: "from-green-400 to-emerald-700" },
    { id: "klasik", emoji: "🍂", name: "Klasik", color: "from-amber-700 to-orange-950" },
  ],
};

/**
 * Stilize nargile seti çizimi (telifsiz, tamamen SVG/gradient).
 * meyveli → modern gold-titanyum gövde, şeffaf cam şişe, siyah hortum,
 *           cam gövdeli siyah halkalı modern lüle (Quasar tarzı karakter).
 * klasik  → geleneksel gold gövde, geniş gold tepsi, kesme cam şişe,
 *           toprak/terracotta lüle (Tradi tarzı karakter).
 */
function HookahFigure({
  variant,
  lit = false,
  className = "",
}: {
  variant: HookahType;
  lit?: boolean;
  className?: string;
}) {
  const m = variant === "meyveli";
  const gold = `g-gold-${variant}`;
  const glass = `g-glass-${variant}`;
  return (
    <svg viewBox="0 0 170 300" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c5f16" />
          <stop offset="45%" stopColor="#f4e08d" />
          <stop offset="100%" stopColor="#9c7a22" />
        </linearGradient>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={m ? "rgba(255,255,255,0.08)" : "rgba(244,208,120,0.14)"} />
          <stop offset="35%" stopColor={m ? "rgba(255,255,255,0.30)" : "rgba(244,208,120,0.34)"} />
          <stop offset="100%" stopColor={m ? "rgba(255,255,255,0.10)" : "rgba(244,208,120,0.12)"} />
        </linearGradient>
      </defs>

      {/* Hortum */}
      <path
        d="M88 86 C 134 96, 152 136, 146 176 C 142 206, 122 226, 103 240"
        fill="none"
        stroke={m ? "#141414" : "#3a2413"}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Hortum ağızlığı */}
      <rect
        x="97"
        y="233"
        width="15"
        height="5"
        rx="2.5"
        transform="rotate(-38 104 235)"
        fill={`url(#${gold})`}
      />

      {/* Şişe (cam) */}
      <path
        d="M80 168 C 46 176, 38 214, 44 244 C 50 272, 66 284, 85 284 C 104 284, 120 272, 126 244 C 132 214, 124 176, 90 168 Z"
        fill={`url(#${glass})`}
        stroke={m ? "rgba(255,255,255,0.40)" : "rgba(244,208,120,0.50)"}
        strokeWidth="1.5"
      />
      {/* Cam parlaması */}
      <ellipse cx="62" cy="222" rx="7" ry="26" fill="rgba(255,255,255,0.28)" />
      {!m && (
        <>
          {/* Kesme cam çizgileri */}
          <path d="M70 180 L64 274" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <path d="M85 172 L85 284" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <path d="M100 180 L106 274" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <path d="M52 224 L118 224" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </>
      )}

      {/* Tepsi */}
      <ellipse cx="85" cy="122" rx={m ? 30 : 43} ry="7" fill={`url(#${gold})`} />
      <ellipse cx="85" cy="120" rx={m ? 30 : 43} ry="5.5" fill="rgba(255,255,255,0.16)" />

      {/* Gövde */}
      <rect x="81" y="52" width="8" height="118" rx="3" fill={`url(#${gold})`} />
      <ellipse cx="85" cy="72" rx="8" ry="3.5" fill={`url(#${gold})`} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      <ellipse cx="85" cy="100" rx="7" ry="3" fill={`url(#${gold})`} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      {!m && (
        <ellipse cx="85" cy="144" rx="9" ry="4" fill={`url(#${gold})`} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      )}

      {/* Lüle tablası */}
      <ellipse cx="85" cy="52" rx="12" ry="4" fill={`url(#${gold})`} />

      {/* Lüle */}
      {m ? (
        <>
          <rect x="72" y="22" width="26" height="26" rx="5" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <rect x="70" y="42" width="30" height="6" rx="3" fill="#151515" />
          <rect x="70" y="16" width="30" height="7" rx="3.5" fill="#151515" />
          <ellipse cx="85" cy="15" rx="12" ry="3.5" fill="#3a3a3a" />
        </>
      ) : (
        <>
          <path d="M71 48 L74 24 C74 20 78 17 85 17 C92 17 96 20 96 24 L99 48 Z" fill="#b0663a" />
          <path d="M74 24 C74 20 78 17 85 17 C92 17 96 20 96 24 L96.6 29 L73.4 29 Z" fill="#8f4f2b" />
          <ellipse cx="85" cy="17.5" rx="9" ry="2.5" fill="#6e3b1f" />
        </>
      )}

      {/* Yanan közler */}
      {lit && (
        <>
          <circle cx="85" cy="13" r="13" fill="rgba(251,146,60,0.22)" />
          <circle cx="77" cy="13" r="4" fill="#f97316" />
          <circle cx="85" cy="11" r="4.5" fill="#fb923c" />
          <circle cx="93" cy="13" r="4" fill="#ef4444" />
        </>
      )}
    </svg>
  );
}

/** 2.5D lüle ağzı — üstten hafif açılı görünüm; içi tütünle dolabilir. */
function BowlMouth({
  type,
  fillPct,
  children,
}: {
  type: HookahType;
  fillPct: number;
  children?: React.ReactNode;
}) {
  const m = type === "meyveli";
  return (
    <div className="relative mx-auto w-48 h-44">
      {/* Gövde (rim'in altı) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-16 w-32 h-24 rounded-b-[2.5rem] ${
          m
            ? "bg-gradient-to-b from-white/15 to-white/5 border-x border-b border-white/25"
            : "bg-gradient-to-b from-orange-800 via-orange-900 to-orange-950"
        }`}
      />
      {m && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[8.6rem] w-36 h-4 rounded-full bg-neutral-900 shadow" />
      )}
      {/* Ağız (ellips rim) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-4 w-44 h-28 rounded-[50%] ${
          m
            ? "bg-neutral-900 shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
            : "bg-gradient-to-br from-orange-700 to-orange-950 shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
        }`}
      />
      {/* İç boşluk */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-6 w-36 h-[5.5rem] rounded-[50%] overflow-hidden ${
          m ? "bg-neutral-950" : "bg-amber-950"
        }`}
      >
        {/* Tütün dolumu */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 transition-all duration-500 ease-out"
          style={{ width: `${fillPct}%`, height: `${fillPct}%` }}
        >
          <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.15),transparent_55%)]" />
        </div>
      </div>
      {children}
    </div>
  );
}

const STEP_LABELS_BASE = [
  "Tip Seç",
  "Aroma Seç",
  "Lüleyi Doldur",
  "Kapak / Folyo",
  "Delik Aç",
  "Közü Yak",
  "Közü Yerleştir",
];

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 text-xs text-white/40 hover:text-white/70 transition"
    >
      ← Geri
    </button>
  );
}

interface NargilePrepGameProps {
  businessName: string;
  slug: string;
}

export default function NargilePrepGame({ businessName, slug }: NargilePrepGameProps) {
  const [step, setStep] = useState<Step>(0);
  const [hookahType, setHookahType] = useState<HookahType | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [tobaccoTaps, setTobaccoTaps] = useState(0);
  const [capDown, setCapDown] = useState(false);
  const [holes, setHoles] = useState<boolean[]>(Array(5).fill(false));
  const [coalProgress, setCoalProgress] = useState(0);
  const [coalsPlaced, setCoalsPlaced] = useState(0);

  function resetGame() {
    setStep(0);
    setHookahType(null);
    setFlavor(null);
    setTobaccoTaps(0);
    setCapDown(false);
    setHoles(Array(5).fill(false));
    setCoalProgress(0);
    setCoalsPlaced(0);
  }

  function resetDownstream() {
    setFlavor(null);
    setTobaccoTaps(0);
    setCapDown(false);
    setHoles(Array(5).fill(false));
    setCoalProgress(0);
    setCoalsPlaced(0);
  }

  function goBack() {
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }

  // Adım tamamlanma kontrolleri fonksiyonel state güncellemeleriyle birlikte
  // effect'te; hızlı art arda dokunuşlarda (özellikle mobilde) eski closure'a
  // bağlı state kaybını önler.
  useEffect(() => {
    if (step === 2 && tobaccoTaps >= 3) {
      const t = setTimeout(() => setStep(3), 350);
      return () => clearTimeout(t);
    }
  }, [step, tobaccoTaps]);

  useEffect(() => {
    if (step === 4 && holes.every(Boolean)) {
      const t = setTimeout(() => setStep(5), 350);
      return () => clearTimeout(t);
    }
  }, [step, holes]);

  useEffect(() => {
    if (step === 5 && coalProgress >= 100) {
      const t = setTimeout(() => setStep(6), 450);
      return () => clearTimeout(t);
    }
  }, [step, coalProgress]);

  useEffect(() => {
    if (step === 6 && coalsPlaced >= 3) {
      const t = setTimeout(() => setStep(7), 450);
      return () => clearTimeout(t);
    }
  }, [step, coalsPlaced]);

  const holesOpen = holes.filter(Boolean).length;
  const m = hookahType === "meyveli";
  const flavors = hookahType ? FLAVORS[hookahType] : [];
  const selectedFlavor = flavors.find((f) => f.id === flavor);
  const stepLabels = STEP_LABELS_BASE.map((l, i) =>
    i === 3 ? (m ? "Kapak Tak" : "Folyo Kapat") : l
  );

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* Sahne */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-green-900 via-green-800 to-green-950 p-6 shadow-2xl min-h-[70vh] flex flex-col justify-center">
        <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 bg-green-400/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* İlerleme göstergesi */}
          {step < 7 && (
            <div className="mb-5">
              <p className="text-center text-[10px] uppercase tracking-widest text-amber-300/70 font-semibold mb-2">
                Adım {step + 1}/7 · {stepLabels[step]}
              </p>
              <div className="flex items-center justify-center gap-1">
                {stepLabels.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-6 bg-amber-400"
                        : i < step
                          ? "w-3 bg-green-400"
                          : "w-3 bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 0: Nargile tipi seç */}
          {step === 0 && (
            <div>
              <h2 className="text-center text-white font-bold text-lg mb-1">Nargile Tipini Seç</h2>
              <p className="text-center text-green-200/70 text-xs mb-5">
                Setine dokunarak hazırlığa başla
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["meyveli", "klasik"] as const).map((t) => {
                  const selected = hookahType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        if (hookahType !== t) resetDownstream();
                        setHookahType(t);
                        window.setTimeout(() => setStep(1), 350);
                      }}
                      className={`rounded-3xl p-3 pt-4 bg-white/5 border transition-all duration-200 active:scale-95 ${
                        selected
                          ? "border-amber-400 ring-2 ring-amber-400/60 bg-white/10"
                          : "border-white/10 hover:border-amber-300/40"
                      }`}
                    >
                      <HookahFigure variant={t} className="h-40 w-full" />
                      <div className="mt-2 font-bold text-sm text-amber-300">
                        {t === "meyveli" ? "Meyveli" : "Klasik"}
                      </div>
                      <div className="text-[10px] text-green-100/70 leading-tight mt-0.5">
                        {t === "meyveli"
                          ? "Modern gold set · cam lüle"
                          : "Geleneksel gold set · toprak lüle"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1: Aroma seç */}
          {step === 1 && hookahType && (
            <div>
              <div className="flex justify-center mb-2">
                <HookahFigure variant={hookahType} className="h-28" />
              </div>
              <h2 className="text-center text-white font-bold text-lg mb-1">Aromanı Seç</h2>
              <p className="text-center text-green-200/70 text-xs mb-4">
                {m ? "Meyveli" : "Klasik"} setine tat verecek aromaya dokun
              </p>
              <div className="grid grid-cols-3 gap-3">
                {flavors.map((f) => {
                  const selected = flavor === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setFlavor(f.id);
                        window.setTimeout(() => setStep(2), 350);
                      }}
                      className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 ${
                        selected ? "scale-105" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${f.color} shadow-lg overflow-hidden transition-all ${
                          selected ? "ring-4 ring-amber-400 ring-offset-2 ring-offset-green-900" : ""
                        }`}
                      >
                        {f.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{f.emoji}</span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-medium text-center leading-tight ${
                          selected ? "text-amber-300" : "text-green-100/80"
                        }`}
                      >
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 2: Lüleyi doldur */}
          {step === 2 && hookahType && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Lüleyi Doldur</h2>
              <p className="text-green-200/70 text-xs mb-4">
                {m ? "Cam lüleye" : "Toprak lüleye"} dokunarak tütünü yerleştir
              </p>
              <button
                onClick={() => setTobaccoTaps((n) => Math.min(3, n + 1))}
                disabled={tobaccoTaps >= 3}
                className="block mx-auto active:scale-95 transition-transform"
              >
                <BowlMouth type={hookahType} fillPct={(tobaccoTaps / 3) * 88} />
              </button>
              <div className="flex justify-center gap-1.5 mt-2 mb-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < tobaccoTaps ? "bg-green-400" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-white/60 text-xs mb-1">
                {tobaccoTaps >= 3 ? "Tamamlandı ✓" : `Dokun (${tobaccoTaps}/3)`}
              </p>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 3: Kapak / folyo */}
          {step === 3 && hookahType && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">
                {m ? "Kapağı Tak" : "Folyoyu Kapat"}
              </h2>
              <p className="text-green-200/70 text-xs mb-4">
                {m
                  ? "Modern metal kapağı lülenin üstüne oturt"
                  : "Lülenin üstünü folyo ile kapat"}
              </p>
              <div className="relative mx-auto w-48 h-44 mb-3">
                <BowlMouth type={hookahType} fillPct={88} />
                {/* İnen kapak/folyo */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-3 w-44 h-28 rounded-[50%] transition-all duration-500 ease-out ${
                    capDown ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
                  } ${
                    m
                      ? "bg-gradient-to-br from-neutral-700 via-neutral-900 to-black shadow-xl"
                      : "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-xl"
                  }`}
                >
                  <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.35),transparent_50%)]" />
                  {m && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow" />
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setCapDown(true);
                  window.setTimeout(() => setStep(4), 550);
                }}
                disabled={capDown}
                className="w-full bg-amber-500 disabled:opacity-60 text-green-950 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95"
              >
                {capDown ? "Yerleşiyor…" : m ? "Kapağı Tak" : "Folyoyu Kapat"}
              </button>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 4: Delik aç */}
          {step === 4 && hookahType && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Delikleri Aç</h2>
              <p className="text-green-200/70 text-xs mb-4">
                {m ? "Kapak" : "Folyo"} üstündeki noktalara dokun ({holesOpen}/5)
              </p>
              <div className="relative mx-auto w-52 h-36 mb-3">
                {/* Kapak/folyo yüzeyi (2.5D) */}
                <div
                  className={`absolute inset-x-2 top-2 bottom-4 rounded-[50%] shadow-xl ${
                    m
                      ? "bg-gradient-to-br from-neutral-700 via-neutral-900 to-black"
                      : "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400"
                  }`}
                >
                  <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.30),transparent_50%)]" />
                </div>
                {holes.map((open, i) => {
                  const angle = (i / holes.length) * 2 * Math.PI - Math.PI / 2;
                  const x = 50 + 34 * Math.cos(angle);
                  const y = 50 + 34 * Math.sin(angle);
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setHoles((prev) => {
                          if (prev[i]) return prev;
                          const next = [...prev];
                          next[i] = true;
                          return next;
                        })
                      }
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-300 active:scale-90 ${
                        open
                          ? "bg-black scale-90 shadow-[inset_0_3px_5px_rgba(0,0,0,1)]"
                          : m
                            ? "bg-neutral-600 shadow-md hover:bg-neutral-500"
                            : "bg-gray-400 shadow-md hover:bg-gray-500"
                      }`}
                    />
                  );
                })}
              </div>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 5: Közü yak */}
          {step === 5 && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Közü Yak</h2>
              <p className="text-green-200/70 text-xs mb-5">Köz kızarana kadar dokun</p>
              <button
                onClick={() => setCoalProgress((p) => Math.min(100, p + 20))}
                disabled={coalProgress >= 100}
                className="relative mx-auto w-28 h-28 mb-5 block active:scale-95 transition-transform rotate-12"
              >
                <div
                  className="absolute inset-0 rounded-2xl transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.22), transparent 45%), linear-gradient(135deg, rgb(${40 + coalProgress * 2}, ${20 + coalProgress}, 10), rgb(${60 + coalProgress * 2}, ${20 + coalProgress * 0.3}, 0))`,
                    boxShadow:
                      coalProgress > 0
                        ? `0 0 ${coalProgress * 0.5}px ${coalProgress * 0.3}px rgba(251,146,60,${coalProgress / 150})`
                        : "none",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-3xl -rotate-12">
                  {coalProgress >= 100 ? "🔥" : ""}
                </div>
              </button>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4 max-w-[180px] mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 transition-all duration-200"
                  style={{ width: `${coalProgress}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mb-1">
                {coalProgress >= 100 ? "Köz Hazır ✓" : `Dokun (${coalProgress / 20}/5)`}
              </p>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 6: Közü yerleştir */}
          {step === 6 && hookahType && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Közü Yerleştir</h2>
              <p className="text-green-200/70 text-xs mb-4">
                Sıcak közleri {m ? "kapağın" : "folyonun"} üstüne yerleştir
              </p>
              <div className="relative mx-auto w-52 h-36 mb-3">
                <div
                  className={`absolute inset-x-2 top-4 bottom-2 rounded-[50%] shadow-xl ${
                    m
                      ? "bg-gradient-to-br from-neutral-700 via-neutral-900 to-black"
                      : "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400"
                  }`}
                >
                  <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.30),transparent_50%)]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-9 rounded-lg rotate-12 flex items-center justify-center transition-all duration-300 ${
                        i < coalsPlaced
                          ? "bg-gradient-to-br from-orange-400 to-red-600 scale-100 shadow-[0_0_14px_5px_rgba(251,146,60,0.55)]"
                          : `scale-75 border-2 border-dashed ${m ? "border-neutral-500" : "border-gray-500/70"} bg-black/20`
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setCoalsPlaced((n) => Math.min(3, n + 1))}
                disabled={coalsPlaced >= 3}
                className="w-full bg-amber-500 disabled:opacity-60 text-green-950 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95"
              >
                {coalsPlaced >= 3 ? "Tamamlandı ✓" : `Köz Yerleştir (${coalsPlaced}/3)`}
              </button>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 7: Servise hazır */}
          {step === 7 && hookahType && (
            <div className="text-center py-2">
              <div className="relative mx-auto w-48 mb-2">
                <HookahFigure variant={hookahType} lit className="h-56 w-full" />
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl opacity-80 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  💨
                </div>
                <div
                  className="absolute -top-6 left-[30%] text-xl opacity-50 animate-bounce"
                  style={{ animationDuration: "4s", animationDelay: "0.5s" }}
                >
                  💨
                </div>
                <div
                  className="absolute -top-6 left-[62%] text-xl opacity-50 animate-bounce"
                  style={{ animationDuration: "3.5s", animationDelay: "1s" }}
                >
                  💨
                </div>
              </div>
              <h2 className="text-xl font-bold text-amber-300 mb-2">Nargile Servise Hazır! 🎉</h2>
              <p className="text-green-100/70 text-sm mb-6">
                {businessName} tarzında {m ? "meyveli" : "klasik"}
                {selectedFlavor ? ` ${selectedFlavor.name}` : ""} nargilen hazır. Afiyet olsun!
              </p>
              <div className="space-y-3">
                <button
                  onClick={resetGame}
                  className="w-full bg-amber-500 text-green-950 py-3.5 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                >
                  Tekrar Oyna
                </button>
                <Link
                  href={`/menu/${slug}`}
                  className="block w-full bg-white/10 border border-white/20 text-white py-3.5 rounded-2xl font-semibold transition-all active:scale-95"
                >
                  Menüye Dön
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
