"use client";

import { useGasFeeData, calculateSavings } from "@/hooks/contract";
import { useState } from "react";

function ShimmerCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-lg">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">{children}</div>
    </div>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 4 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const display = value.toFixed(decimals);
  return <span>{prefix}{display}{suffix}</span>;
}

export default function Savings() {
  const { feeData, txFeeXLM, txFeeUSD, loading, error } = useGasFeeData();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const monthlyFeesXLM = txFeeXLM * 100; // assume 100 tx/month
  const savings = calculateSavings(monthlyFeesXLM, feeData.xlmPrice);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Savings Optimizer</h1>
        <p className="mt-1 text-zinc-500">Discover how much you can save by optimizing transaction usage</p>
      </div>

      {/* Current spending summary */}
      {loading ? (
        <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-3 h-4 w-40 rounded bg-zinc-800" />
          <div className="h-8 w-32 rounded bg-zinc-800" />
        </div>
      ) : error ? (
        <div className="animate-slideUp rounded-2xl border border-red-800/50 bg-red-600/10 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      ) : (
        <ShimmerCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Current Monthly Spend (est.)</p>
              <p className="text-3xl font-bold text-white">{monthlyFeesXLM.toFixed(4)} XLM</p>
              <p className="text-lg text-indigo-400">${(monthlyFeesXLM * feeData.xlmPrice).toFixed(4)} USD</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-zinc-900/50 px-4 py-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm text-zinc-400">Based on</p>
                <p className="font-semibold text-white">100 tx/month</p>
              </div>
            </div>
          </div>
        </ShimmerCard>
      )}

      {/* Scenarios grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {savings.map((s, i) => (
          <div
            key={i}
            onClick={() => setSelectedScenario(selectedScenario === i ? null : i)}
            className={`animate-slideUp cursor-pointer rounded-2xl border p-6 backdrop-blur transition-all duration-300 hover:scale-[1.02] opacity-0 ${
              selectedScenario === i
                ? "border-indigo-600 bg-indigo-600/10 shadow-lg shadow-indigo-600/20"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: "forwards" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{s.frequencyLabel}</p>
                <p className="mt-1 text-sm text-zinc-500">Over {s.duration}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                s.reduction >= 20 ? "bg-emerald-600/20 text-emerald-400" : s.reduction >= 10 ? "bg-indigo-600/20 text-indigo-400" : "bg-zinc-600/20 text-zinc-400"
              }`}>
                -{s.reduction}%
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Monthly Save</p>
                <p className="text-xl font-bold text-white">{s.monthlySave.toFixed(4)} XLM</p>
                <p className="text-sm text-indigo-400">${s.monthlySaveUSD.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Yearly Save</p>
                <p className="text-xl font-bold text-white">{s.yearlySave.toFixed(4)} XLM</p>
                <p className="text-sm text-indigo-400">${s.yearlySaveUSD.toFixed(4)}</p>
              </div>
            </div>

            {/* Expanded details */}
            <div className={`overflow-hidden transition-all duration-300 ${
              selectedScenario === i ? "mt-6 max-h-40" : "max-h-0"
            }`}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total saved over {s.duration}</span>
                  <span className="font-semibold text-emerald-400">{s.totalSaved.toFixed(4)} XLM</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-zinc-400">USD equivalent</span>
                  <span className="font-semibold text-emerald-400">${s.totalSavedUSD.toFixed(4)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Click to {selectedScenario === i ? "collapse" : "expand"} details
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action steps */}
      <ShimmerCard>
        <h2 className="mb-4 text-xl font-semibold text-white">How to Save</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Analyze", desc: "Review your transaction history to identify patterns", color: "from-indigo-600 to-blue-600" },
            { step: "2", title: "Optimize", desc: "Batch operations and time transactions during low fee periods", color: "from-purple-600 to-pink-600" },
            { step: "3", title: "Monitor", desc: "Use this dashboard to track your savings over time", color: "from-emerald-600 to-teal-600" },
          ].map((action, i) => (
            <div key={i} className="animate-slideUp rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 opacity-0 transition-all hover:border-zinc-700" style={{ animationDelay: `${600 + i * 150}ms`, animationFillMode: "forwards" }}>
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-lg font-bold text-white shadow-lg`}>
                {action.step}
              </div>
              <p className="mt-3 font-semibold text-white">{action.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{action.desc}</p>
            </div>
          ))}
        </div>
      </ShimmerCard>
    </div>
  );
}
