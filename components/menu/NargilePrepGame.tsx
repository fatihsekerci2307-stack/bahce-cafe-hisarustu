"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const FLAVORS = [
  { id: "elma", emoji: "🍏", name: "Elma" },
  { id: "uzum-nane", emoji: "🍇", name: "Üzüm Nane" },
  { id: "karpuz", emoji: "🍉", name: "Karpuz" },
  { id: "seftali", emoji: "🍑", name: "Şeftali" },
  { id: "cift-elma", emoji: "🍏", name: "Çift Elma" },
  { id: "limon-nane", emoji: "🍋", name: "Limon Nane" },
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
      className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition"
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
  const [holes, setHoles] = useState<boolean[]>(Array(5).fill(false));
  const [coalProgress, setCoalProgress] = useState(0);
  const [coalsPlaced, setCoalsPlaced] = useState(0);

  function resetGame() {
    setStep(0);
    setFlavor(null);
    setTobaccoTaps(0);
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
      const t = setTimeout(() => setStep(2), 300);
      return () => clearTimeout(t);
    }
  }, [step, tobaccoTaps]);

  useEffect(() => {
    if (step === 3 && holes.every(Boolean)) {
      const t = setTimeout(() => setStep(4), 300);
      return () => clearTimeout(t);
    }
  }, [step, holes]);

  useEffect(() => {
    if (step === 4 && coalProgress >= 100) {
      const t = setTimeout(() => setStep(5), 400);
      return () => clearTimeout(t);
    }
  }, [step, coalProgress]);

  useEffect(() => {
    if (step === 5 && coalsPlaced >= 3) {
      const t = setTimeout(() => setStep(6), 400);
      return () => clearTimeout(t);
    }
  }, [step, coalsPlaced]);

  const holesOpen = holes.filter(Boolean).length;
  const selectedFlavor = FLAVORS.find((f) => f.id === flavor);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* İlerleme göstergesi */}
      {step < 6 && (
        <div className="mb-6">
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>Adım {step + 1}/6</span>
            <span>{STEP_LABELS[step]}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-700 transition-all duration-300"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 0: Aroma seç */}
      {step === 0 && (
        <div>
          <h2 className="text-center font-bold text-gray-800 mb-1">Aromanı Seç</h2>
          <p className="text-center text-xs text-gray-400 mb-4">
            Nargilene tat verecek aromayı seç
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FLAVORS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFlavor(f.id)}
                className={`p-4 rounded-2xl border-2 text-center transition active:scale-95 ${
                  flavor === f.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <div className="text-3xl mb-1">{f.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{f.name}</div>
              </button>
            ))}
          </div>
          <button
            disabled={!flavor}
            onClick={() => setStep(1)}
            className="w-full mt-6 bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition active:scale-95"
          >
            Devam Et
          </button>
        </div>
      )}

      {/* 1: Lüleyi doldur - 3 dokunuş */}
      {step === 1 && (
        <div className="text-center">
          <h2 className="font-bold text-gray-800 mb-1">Lüleyi Doldur</h2>
          <p className="text-xs text-gray-400 mb-6">
            Tütünü lüleye yerleştirmek için dokun
          </p>
          <div className="text-6xl mb-6">🏺</div>
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 transition ${
                  i < tobaccoTaps ? "bg-green-700 border-green-700" : "border-gray-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setTobaccoTaps((n) => Math.min(3, n + 1))}
            disabled={tobaccoTaps >= 3}
            className="w-full bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition active:scale-95"
          >
            {tobaccoTaps >= 3 ? "Tamamlandı ✓" : `Yerleştir (${tobaccoTaps}/3)`}
          </button>
          <BackButton onClick={goBack} />
        </div>
      )}

      {/* 2: Folyo kapat */}
      {step === 2 && (
        <div className="text-center">
          <h2 className="font-bold text-gray-800 mb-1">Folyo / Kapak Yerleştir</h2>
          <p className="text-xs text-gray-400 mb-6">Lülenin üstünü folyo ile kapat</p>
          <div className="text-6xl mb-6">🥁</div>
          <button
            onClick={() => setStep(3)}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition active:scale-95"
          >
            Folyoyu Kapat
          </button>
          <BackButton onClick={goBack} />
        </div>
      )}

      {/* 3: Delik aç - 5 nokta */}
      {step === 3 && (
        <div className="text-center">
          <h2 className="font-bold text-gray-800 mb-1">Delikleri Aç</h2>
          <p className="text-xs text-gray-400 mb-6">
            Folyoya delik açmak için noktalara dokun ({holesOpen}/5)
          </p>
          <div className="grid grid-cols-5 gap-3 mb-6 max-w-xs mx-auto">
            {holes.map((open, i) => (
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
                className={`aspect-square rounded-full border-2 transition active:scale-90 ${
                  open ? "bg-gray-800 border-gray-800" : "bg-white border-gray-300"
                }`}
              />
            ))}
          </div>
          <BackButton onClick={goBack} />
        </div>
      )}

      {/* 4: Köz yak - progress */}
      {step === 4 && (
        <div className="text-center">
          <h2 className="font-bold text-gray-800 mb-1">Közü Yak</h2>
          <p className="text-xs text-gray-400 mb-6">Köz kızarana kadar dokunmaya devam et</p>
          <div className="text-6xl mb-4">{coalProgress >= 100 ? "🔥" : "⚫"}</div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
            <div
              className="h-full bg-orange-500 transition-all duration-200"
              style={{ width: `${coalProgress}%` }}
            />
          </div>
          <button
            onClick={() => setCoalProgress((p) => Math.min(100, p + 20))}
            disabled={coalProgress >= 100}
            className="w-full bg-orange-600 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition active:scale-95"
          >
            {coalProgress >= 100 ? "Köz Hazır ✓" : "Ateşle"}
          </button>
          <BackButton onClick={goBack} />
        </div>
      )}

      {/* 5: Köz yerleştir - 3 adet */}
      {step === 5 && (
        <div className="text-center">
          <h2 className="font-bold text-gray-800 mb-1">Közü Yerleştir</h2>
          <p className="text-xs text-gray-400 mb-6">Sıcak közleri folyonun üstüne yerleştir</p>
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-4xl">
                {i < coalsPlaced ? "🔥" : "⚪"}
              </div>
            ))}
          </div>
          <button
            onClick={() => setCoalsPlaced((n) => Math.min(3, n + 1))}
            disabled={coalsPlaced >= 3}
            className="w-full bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition active:scale-95"
          >
            {coalsPlaced >= 3 ? "Tamamlandı ✓" : `Köz Yerleştir (${coalsPlaced}/3)`}
          </button>
          <BackButton onClick={goBack} />
        </div>
      )}

      {/* 6: Servise hazır */}
      {step === 6 && (
        <div className="text-center py-6">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Nargile Servise Hazır!</h2>
          <p className="text-sm text-gray-500 mb-8">
            {businessName} tarzında{selectedFlavor ? ` ${selectedFlavor.name}` : ""} aromalı
            nargilen hazır. Afiyet olsun!
          </p>
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold transition active:scale-95"
            >
              Tekrar Oyna
            </button>
            <Link
              href={`/menu/${slug}`}
              className="block w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition active:scale-95"
            >
              Menüye Dön
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
