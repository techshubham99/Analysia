"use client";

import { useGasFeeData, calculateTxCost, TxCalculation } from "@/hooks/contract";
import { useState, useEffect, useRef } from "react";

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 6 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const startTime = performance.now();
    const duration = 600;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  const formatted = display.toFixed(decimals);
  return <span>{prefix}{formatted}{suffix}</span>;
}

function ShimmerCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-lg ${className || ""}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { feeData, txFeeXLM, txFeeUSD, loading, error, refresh } = useGasFeeData();
  const [txType, setTxType] = useState("simple");
  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState<TxCalculation | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const handleCalculate = () => {
    // Re-trigger the calculation animation
    setCalculating(true);
    setAnimKey((k) => k + 1);
    setTimeout(() => {
      const calc = calculateTxCost(txType, feeData.sorobanFee, feeData.xlmPrice);
      setCalculation(calc);
      setCalculating(false);
    }, 400); // brief delay for visual feedback
  };

  // Auto-calculate on first load or when fee data changes
  useEffect(() => {
    if (feeData.sorobanFee && !calculation) {
      setCalculation(calculateTxCost(txType, feeData.sorobanFee, feeData.xlmPrice));
    }
  }, [feeData]);

  const txTypes = [
    { id: "simple", label: "Simple Transfer", icon: "↔️", desc: "Basic XLM transfer" },
    { id: "swap", label: "Token Swap", icon: "🔄", desc: "Asset swap (3x fee)" },
    { id: "contract", label: "Contract Call", icon: "⚙️", desc: "Smart contract interaction (5x fee)" },
    { id: "data", label: "Data Write", icon: "💾", desc: "Storage-heavy tx (2x fee)" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-zinc-500">Real-time Stellar network fee overview</p>
        </div>
        <button
          onClick={() => { refresh(); handleCalculate(); }}
          disabled={loading}
          className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/30 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          )}
          {loading ? "Refreshing…" : "Refresh & Calculate"}
        </button>
      </div>

      {/* Loading or Error */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-3 h-4 w-24 rounded bg-zinc-800" />
              <div className="h-8 w-36 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="animate-slideUp rounded-2xl border border-red-800/50 bg-red-600/10 p-4 text-sm text-red-400">
          ⚠️ {error}
          <button onClick={refresh} className="ml-2 underline hover:text-red-300">Retry</button>
        </div>
      )}

      {/* Fee Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ShimmerCard>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500">Network Fee</p>
              {feeData.surge ? (
                <span className="rounded-full bg-amber-600/20 px-2 py-0.5 text-xs font-medium text-amber-400 animate-pulse">
                  SURGING
                </span>
              ) : (
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Normal
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              <AnimatedNumber value={parseInt(feeData.maxFee) / 10_000_000} decimals={6} suffix=" XLM" />
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              <AnimatedNumber value={parseInt(feeData.maxFee) / 10_000_000 * feeData.xlmPrice} prefix="$" decimals={4} />
            </p>
          </ShimmerCard>

          <ShimmerCard>
            <p className="text-sm font-medium text-zinc-500">Soroban Fee</p>
            <p className="mt-2 text-3xl font-bold text-white">
              <AnimatedNumber value={txFeeXLM} decimals={6} suffix=" XLM" />
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              <AnimatedNumber value={txFeeUSD} prefix="$" decimals={4} />
            </p>
          </ShimmerCard>

          <ShimmerCard>
            <p className="text-sm font-medium text-zinc-500">XLM Price</p>
            <p className="mt-2 text-3xl font-bold text-white">
              <AnimatedNumber value={feeData.xlmPrice} prefix="$" decimals={4} />
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-1" />
              Live from CoinGecko
            </p>
          </ShimmerCard>
        </div>
      )}

      {/* Real-Time Calculator */}
      <ShimmerCard>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Input section */}
          <div className="flex-1 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Real-Time Fee Calculator</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Select transaction type and calculate the exact fee
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {txTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTxType(t.id)}
                  className={`group relative rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                    txType === t.id
                      ? "border-indigo-600 bg-indigo-600/10 shadow-lg shadow-indigo-600/10"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className={`mt-2 text-sm font-medium ${txType === t.id ? "text-indigo-400" : "text-zinc-300"}`}>
                    {t.label}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{t.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-emerald-600/30 disabled:opacity-50 disabled:hover:scale-100"
            >
              {calculating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Calculating…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calculate Fee Now
                </>
              )}
            </button>
          </div>

          {/* Results */}
          <div key={animKey} className="w-full shrink-0 animate-fadeIn lg:w-80">
            {calculation && (
              <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm font-medium text-zinc-400">Calculation Results</p>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-sm text-zinc-500">Transaction Fee</span>
                    <span className="text-sm font-semibold text-white">
                      <AnimatedNumber value={calculation.feeXLM} decimals={6} suffix=" XLM" />
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-sm text-zinc-500">Gas Estimate</span>
                    <span className="text-sm font-semibold text-white">
                      <AnimatedNumber value={calculation.gasXLM} decimals={6} suffix=" XLM" />
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-sm text-zinc-500">USD Value</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      <AnimatedNumber value={calculation.totalUSD} prefix="$" decimals={4} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-400">Total</span>
                    <span className="text-lg font-bold text-white">
                      <AnimatedNumber value={calculation.totalXLM} decimals={6} suffix=" XLM" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ShimmerCard>

      {/* Recent Activity Skeleton */}
      <ShimmerCard>
        <h2 className="mb-4 text-xl font-semibold text-white">Recent Network Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg bg-zinc-900/30 p-4">
              <div className="h-8 w-8 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 rounded bg-zinc-800" />
                <div className="h-2 w-24 rounded bg-zinc-800" />
              </div>
              <div className="h-4 w-16 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </ShimmerCard>
    </div>
  );
}
