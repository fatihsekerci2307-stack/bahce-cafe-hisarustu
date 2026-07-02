"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface FlavorOption {
  id: string;
  emoji: string;
  name: string;
  /** Orb arka planı için Tailwind gradient sınıfları (görsel yoksa kullanılır) */
  color: string;
  /** İleride gerçek ürün görseli eklenirse buraya URL konur; şimdilik boş */
  image?: string;
}

const FLAVORS: FlavorOption[] = [
  { id: "elma", emoji: "🍏", name: "Elma", color: "from-lime-400 to-green-600" },
  { id: "uzum-nane", emoji: "🍇", name: "Üzüm Nane", color: "from-purple-400 to-purple-700" },
  { id: "karpuz", emoji: "🍉", name: "Karpuz", color: "from-red-400 to-pink-600" },
  { id: "seftali", emoji: "🍑", name: "Şeftali", color: "from-orange-300 to-orange-500" },
  { id: "cift-elma", emoji: "🍏", name: "Çift Elma", color: "from-emerald-400 to-teal-600" },
  { id: "limon-nane", emoji: "🍋", name: "Limon Nane", color: "from-yellow-300 to-lime-500" },
];

const STEP_LABELS = [
  "Aroma Seç",
  "Lüleyi Doldur",
  "Folyo Kapat",
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
  const [flavor, setFlavor] = useState<string | null>(null);
  const [tobaccoTaps, setTobaccoTaps] = useState(0);
  const [foilDown, setFoilDown] = useState(false);
  const [holes, setHoles] = useState<boolean[]>(Array(5).fill(false));
  const [coalProgress, setCoalProgress] = useState(0);
  const [coalsPlaced, setCoalsPlaced] = useState(0);

  function resetGame() {
    setStep(0);
    setFlavor(null);
    setTobaccoTaps(0);
    setFoilDown(false);
    setHoles(Array(5).fill(false));
    setCoalProgress(0);
    setCoalsPlaced(0);
  }

  function goBack() {
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }

  // Adım tamamlanma kontrolleri fonksiyonel state güncellemeleriyle birlikte
  // effect'e taşındı; hızlı art arda dokunuşlarda (özellikle mobilde) eski
  // closure'a bağlı state kaybını önler.
  useEffect(() => {
    if (step === 1 && tobaccoTaps >= 3) {
      const t = setTimeout(() => setStep(2), 350);
      return () => clearTimeout(t);
    }
  }, [step, tobaccoTaps]);

  useEffect(() => {
    if (step === 3 && holes.every(Boolean)) {
      const t = setTimeout(() => setStep(4), 350);
      return () => clearTimeout(t);
    }
  }, [step, holes]);

  useEffect(() => {
    if (step === 4 && coalProgress >= 100) {
      const t = setTimeout(() => setStep(5), 450);
      return () => clearTimeout(t);
    }
  }, [step, coalProgress]);

  useEffect(() => {
    if (step === 5 && coalsPlaced >= 3) {
      const t = setTimeout(() => setStep(6), 450);
      return () => clearTimeout(t);
    }
  }, [step, coalsPlaced]);

  const holesOpen = holes.filter(Boolean).length;
  const selectedFlavor = FLAVORS.find((f) => f.id === flavor);

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* Sahne */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-green-900 via-green-800 to-green-950 p-6 shadow-2xl min-h-[70vh] flex flex-col justify-center">
        <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 bg-green-400/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* İlerleme göstergesi */}
          {step < 6 && (
            <div className="mb-6">
              <p className="text-center text-[10px] uppercase tracking-widest text-amber-300/70 font-semibold mb-2">
                Adım {step + 1}/6 · {STEP_LABELS[step]}
              </p>
              <div className="flex items-center justify-center gap-1">
                {STEP_LABELS.map((_, i) => (
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

          {/* 0: Aroma seç */}
          {step === 0 && (
            <div>
              <h2 className="text-center text-white font-bold text-lg mb-1">Aromanı Seç</h2>
              <p className="text-center text-green-200/70 text-xs mb-5">
                Nargilene tat verecek aromayı seç
              </p>
              <div className="grid grid-cols-3 gap-3">
                {FLAVORS.map((f) => {
                  const selected = flavor === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFlavor(f.id)}
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
              <button
                disabled={!flavor}
                onClick={() => setStep(1)}
                className="w-full mt-6 bg-amber-500 disabled:bg-white/10 disabled:text-white/30 text-green-950 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95"
              >
                Devam Et →
              </button>
            </div>
          )}

          {/* 1: Lüleyi doldur - dokunarak doldur */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Lüleyi Doldur</h2>
              <p className="text-green-200/70 text-xs mb-6">
                Dokunarak tütünü lüleye yerleştir
              </p>
              <button
                onClick={() => setTobaccoTaps((n) => Math.min(3, n + 1))}
                disabled={tobaccoTaps >= 3}
                className="relative mx-auto w-40 h-40 mb-5 block active:scale-95 transition-transform"
              >
                <div className="absolute inset-0 rounded-full border-4 border-amber-800/60 bg-gradient-to-b from-amber-900/40 to-amber-950/60 shadow-inner overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-700 via-green-600 to-green-500 transition-all duration-500 ease-out"
                    style={{ height: `${(tobaccoTaps / 3) * 100}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🍃</div>
              </button>
              <div className="flex justify-center gap-1.5 mb-4">
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

          {/* 2: Folyo kapat */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Folyo / Kapak Yerleştir</h2>
              <p className="text-green-200/70 text-xs mb-6">Lülenin üstünü folyo ile kapat</p>
              <div className="relative mx-auto w-40 h-40 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-amber-800/60 bg-gradient-to-b from-green-700 to-green-800 shadow-inner" />
                <div
                  className={`absolute inset-2 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-lg transition-all duration-500 ease-out ${
                    foilDown ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0"
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/60 via-transparent to-transparent" />
                </div>
              </div>
              <button
                onClick={() => {
                  setFoilDown(true);
                  setTimeout(() => setStep(3), 500);
                }}
                disabled={foilDown}
                className="w-full bg-amber-500 disabled:opacity-60 text-green-950 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95"
              >
                {foilDown ? "Kapatılıyor…" : "Folyoyu Kapat"}
              </button>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 3: Delik aç - foil üzerinde 5 nokta */}
          {step === 3 && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Delikleri Aç</h2>
              <p className="text-green-200/70 text-xs mb-6">
                Folyoya delik açmak için noktalara dokun ({holesOpen}/5)
              </p>
              <div className="relative mx-auto w-44 h-44 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-lg">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/60 via-transparent to-transparent" />
                </div>
                {holes.map((open, i) => {
                  const angle = (i / holes.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = 34;
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full transition-all duration-300 active:scale-90 ${
                        open
                          ? "bg-gray-900 scale-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
                          : "bg-gray-400 scale-90 shadow-md hover:scale-100"
                      }`}
                    />
                  );
                })}
              </div>
              <BackButton onClick={goBack} />
            </div>
          )}

          {/* 4: Köz yak - renk geçişli */}
          {step === 4 && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Közü Yak</h2>
              <p className="text-green-200/70 text-xs mb-6">Köz kızarana kadar dokun</p>
              <button
                onClick={() => setCoalProgress((p) => Math.min(100, p + 20))}
                disabled={coalProgress >= 100}
                className="relative mx-auto w-32 h-32 mb-5 block active:scale-95 transition-transform"
              >
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.25), transparent 45%), linear-gradient(135deg, rgb(${40 + coalProgress * 2}, ${20 + coalProgress}, 10), rgb(${60 + coalProgress * 2}, ${20 + coalProgress * 0.3}, 0))`,
                    boxShadow:
                      coalProgress > 0
                        ? `0 0 ${coalProgress * 0.5}px ${coalProgress * 0.3}px rgba(251,146,60,${coalProgress / 150})`
                        : "none",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {coalProgress >= 100 ? "🔥" : "⚫"}
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

          {/* 5: Köz yerleştir - foil üzerindeki 3 hazne */}
          {step === 5 && (
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Közü Yerleştir</h2>
              <p className="text-green-200/70 text-xs mb-6">
                Sıcak közleri folyonun üstüne yerleştir
              </p>
              <div className="relative mx-auto w-44 h-44 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-lg" />
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                        i < coalsPlaced
                          ? "bg-gradient-to-br from-orange-400 to-red-600 scale-100 shadow-[0_0_12px_4px_rgba(251,146,60,0.6)]"
                          : "bg-gray-500/40 scale-75 border-2 border-dashed border-gray-500/60"
                      }`}
                    >
                      {i < coalsPlaced ? "🔥" : ""}
                    </div>
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

          {/* 6: Servise hazır - duman efekti */}
          {step === 6 && (
            <div className="text-center py-2">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg" />
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl opacity-80 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  💨
                </div>
                <div
                  className="absolute -top-6 left-[32%] text-2xl opacity-50 animate-bounce"
                  style={{ animationDuration: "4s", animationDelay: "0.5s" }}
                >
                  💨
                </div>
                <div
                  className="absolute -top-6 left-[62%] text-2xl opacity-50 animate-bounce"
                  style={{ animationDuration: "3.5s", animationDelay: "1s" }}
                >
                  💨
                </div>
              </div>
              <h2 className="text-xl font-bold text-amber-300 mb-2">Nargile Servise Hazır! 🎉</h2>
              <p className="text-green-100/70 text-sm mb-8">
                {businessName} tarzında{selectedFlavor ? ` ${selectedFlavor.name}` : ""} aromalı
                nargilen hazır. Afiyet olsun!
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
