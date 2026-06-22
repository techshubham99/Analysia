"use client";

import { useGasFeeData, calculateDeployCost } from "@/hooks/contract";
import { useState, useEffect, useRef } from "react";
import { getActiveNetwork } from "@/lib/stellar";

function ShimmerCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-lg">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">{children}</div>
    </div>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 6 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const display = value.toFixed(decimals);
  return <span>{prefix}{display}{suffix}</span>;
}

export default function DeployCost() {
  const { feeData, loading, error } = useGasFeeData();
  const [codeSize, setCodeSize] = useState(512);
  const [network, setNetwork] = useState<"testnet" | "mainnet">(getActiveNetwork());
  const [result, setResult] = useState<ReturnType<typeof calculateDeployCost> | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleCalculate = () => {
    setCalculating(true);
    setAnimKey((k) => k + 1);
    setTimeout(() => {
      const calc = calculateDeployCost(codeSize, network, feeData.xlmPrice);
      setResult(calc);
      setCalculating(false);
    }, 350);
  };

  // Auto-calculate on initial load
  useEffect(() => {
    if (feeData.xlmPrice > 0 && !result) {
      handleCalculate();
    }
  }, [feeData.xlmPrice]);

  const presets = [
    { label: "Minimal", size: 128, desc: "Simple counter or registry" },
    { label: "Small", size: 512, desc: "Voting or todo list" },
    { label: "Medium", size: 2048, desc: "Token or crowdfunding" },
    { label: "Large", size: 8192, desc: "DEX or lending" },
    { label: "Custom", size: 0, desc: "Enter your own" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Deploy Cost Estimator</h1>
        <p className="mt-1 text-zinc-500">Estimate the cost of deploying a Soroban smart contract</p>
      </div>

      {error && (
        <div className="animate-slideUp rounded-2xl border border-red-800/50 bg-red-600/10 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Input panel */}
        <div className="space-y-6 lg:col-span-2">
          <ShimmerCard>
            <h2 className="mb-4 text-lg font-semibold text-white">Contract Size</h2>

            {/* Preset buttons */}
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => p.size > 0 && setCodeSize(p.size)}
                  className={`rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] ${
                    codeSize === p.size
                      ? "border-indigo-600 bg-indigo-600/10"
                      : p.size === 0
                        ? "border-zinc-800 bg-zinc-900/30 opacity-50"
                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                >
                  <p className={`text-sm font-medium ${codeSize === p.size ? "text-indigo-400" : "text-zinc-300"}`}>
                    {p.label}
                  </p>
                  {p.size > 0 && (
                    <p className="mt-0.5 text-xs text-zinc-500">{p.size} bytes</p>
                  )}
                  <p className="mt-0.5 text-[10px] text-zinc-600">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Custom size input */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Custom Size (bytes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={100000}
                  value={codeSize}
                  onChange={(e) => setCodeSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </ShimmerCard>

          {/* Network toggle */}
          <ShimmerCard>
            <h2 className="mb-3 text-lg font-semibold text-white">Network</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setNetwork("testnet")}
                className={`flex-1 rounded-xl border p-3 text-center transition-all duration-200 hover:scale-[1.02] ${
                  network === "testnet"
                    ? "border-emerald-600 bg-emerald-600/10"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <span className={`text-sm font-medium ${network === "testnet" ? "text-emerald-400" : "text-zinc-400"}`}>
                  Testnet
                </span>
                <p className="mt-0.5 text-xs text-zinc-600">Free to deploy</p>
              </button>
              <button
                onClick={() => setNetwork("mainnet")}
                className={`flex-1 rounded-xl border p-3 text-center transition-all duration-200 hover:scale-[1.02] ${
                  network === "mainnet"
                    ? "border-amber-600 bg-amber-600/10"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <span className={`text-sm font-medium ${network === "mainnet" ? "text-amber-400" : "text-zinc-400"}`}>
                  Mainnet
                </span>
                <p className="mt-0.5 text-xs text-zinc-600">Real XLM cost</p>
              </button>
            </div>
          </ShimmerCard>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            disabled={loading || calculating}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-600/30 disabled:opacity-50 disabled:hover:scale-100"
          >
            {calculating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Calculating…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate Cost
              </span>
            )}
          </button>
        </div>

        {/* Results panel */}
        <div key={animKey} className="animate-fadeIn lg:col-span-3">
          <ShimmerCard>
            <h2 className="mb-6 text-lg font-semibold text-white">Estimated Cost</h2>

            {!result ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <span className="text-4xl">📋</span>
                  <p className="mt-3 text-zinc-500">Enter contract size and click Calculate</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-zinc-900/50 p-4">
                    <p className="text-xs text-zinc-500">Base Fee</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {(result.baseFee / 10_000_000).toFixed(6)} XLM
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-900/50 p-4">
                    <p className="text-xs text-zinc-500">Per-Byte Fee</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {(result.perByteFee / 10_000_000).toFixed(8)} XLM/byte
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-xl border border-indigo-800/50 bg-indigo-600/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-400">Total Deploy Cost</p>
                      <p className="mt-1 text-xs text-indigo-400/60">Includes base fee + {codeSize} bytes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">
                        <AnimatedNumber value={result.totalXLM} decimals={6} suffix=" XLM" />
                      </p>
                      <p className="text-lg text-indigo-400">
                        <AnimatedNumber value={result.totalUSD} prefix="$" decimals={4} />
                      </p>
                    </div>
                  </div>
                </div>

                {/* With gas reserve */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">With Gas Reserve (30 days)</p>
                      <p className="text-xs text-zinc-600">Extra XLM for contract invocation fees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        <AnimatedNumber value={result.withGasXLM} decimals={6} suffix=" XLM" />
                      </p>
                      <p className="text-sm text-zinc-400">
                        <AnimatedNumber value={result.withGasUSD} prefix="$" decimals={4} />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Breakdown bar */}
                <div>
                  <p className="mb-2 text-xs text-zinc-500">Cost Breakdown</p>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-700"
                      style={{ width: `${Math.min(100, (result.baseFee / result.totalStroops) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-zinc-600">
                    <span>Base: {(result.baseFee / result.totalStroops * 100).toFixed(1)}%</span>
                    <span>Per-byte: {((result.totalStroops - result.baseFee) / result.totalStroops * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </ShimmerCard>

          {/* Info card */}
          {result && (
            <div className="mt-4 animate-slideUp rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-500 opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  These estimates are based on current network fees. Actual costs may vary depending on
                  network conditions at the time of deployment.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
