"use client";

import { useGasFeeData, calculateSpendSummary } from "@/hooks/contract";
import { useEffect, useState } from "react";

function ShimmerCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-lg">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">{children}</div>
    </div>
  );
}

function StatCard({ label, value, sub, delay }: { label: string; value: string; sub?: string; delay: number }) {
  return (
    <div
      className="animate-slideUp rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

export default function Analysis() {
  const { feeData, txFeeXLM, txFeeUSD, loading } = useGasFeeData();
  const [summary, setSummary] = useState<ReturnType<typeof calculateSpendSummary> | null>(null);

  // Simulated tx history (in production, fetched from contract)
  useEffect(() => {
    if (feeData.xlmPrice > 0) {
      // Generate some sample transactions around current time
      const now = Date.now() / 1000;
      const sampleTxs = Array.from({ length: 50 }, (_, i) => ({
        amount: parseInt(feeData.sorobanFee) * (1 + Math.floor(Math.random() * 5)),
        timestamp: now - i * 3600 * (1 + Math.random()), // spread over ~2 days
      }));
      setSummary(calculateSpendSummary(sampleTxs, feeData.xlmPrice));
    }
  }, [feeData]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Spend Analysis</h1>
        <p className="mt-1 text-zinc-500">Breakdown of your Stellar network spending</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-3 h-4 w-24 rounded bg-zinc-800" />
              <div className="h-8 w-32 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Per-tx cost */}
          <ShimmerCard>
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Per-Transaction Cost</h2>
            <p className="text-4xl font-bold text-white">{txFeeXLM.toFixed(6)}</p>
            <p className="text-lg text-indigo-400">{txFeeUSD.toFixed(4)} USD</p>
            <p className="mt-1 text-xs text-zinc-600">Based on current Soroban fee</p>
          </ShimmerCard>

          {/* Monthly estimate */}
          <ShimmerCard>
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Monthly Estimate</h2>
            <p className="text-4xl font-bold text-white">{(txFeeXLM * 100).toFixed(2)}</p>
            <p className="text-lg text-indigo-400">{(txFeeUSD * 100).toFixed(2)} USD</p>
            <p className="mt-1 text-xs text-zinc-600">~100 transactions/month</p>
          </ShimmerCard>

          {/* Surge indicator */}
          <ShimmerCard>
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Network Status</h2>
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${feeData.surge ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-2xl font-bold text-white">{feeData.surge ? "Surge" : "Normal"}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-600">
              {feeData.surge
                ? "Fees are elevated due to high demand"
                : "Network operating normally"
              }
            </p>
          </ShimmerCard>
        </div>
      )}

      {/* Detailed breakdown */}
      {summary && (
        <ShimmerCard>
          <h2 className="mb-6 text-xl font-semibold text-white">Spending Breakdown</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Weekly"
              value={`${summary.weekly.toFixed(4)} XLM`}
              sub={`$${summary.weeklyUSD.toFixed(4)}`}
              delay={0}
            />
            <StatCard
              label="Monthly"
              value={`${summary.monthly.toFixed(4)} XLM`}
              sub={`$${summary.monthlyUSD.toFixed(4)}`}
              delay={100}
            />
            <StatCard
              label="Yearly (Projected)"
              value={`${summary.yearly.toFixed(4)} XLM`}
              sub={`$${summary.yearlyUSD.toFixed(4)}`}
              delay={200}
            />
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-600">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-600" />
            Based on {summary.txCount} recent transactions
          </div>
        </ShimmerCard>
      )}

      {/* Tips */}
      <ShimmerCard>
        <h2 className="mb-4 text-xl font-semibold text-white">Optimization Tips</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: "⏰", title: "Time Your Transactions", desc: "Fees are lower during off-peak hours. Check network status before submitting." },
            { icon: "📦", title: "Batch Operations", desc: "Use Stellar's built-in operation batching to combine multiple actions in one tx." },
            { icon: "🪙", title: "Maintain XLM Balance", desc: "Keep enough XLM for fees to avoid failed transactions due to insufficient balance." },
            { icon: "📊", title: "Monitor Spending", desc: "Regularly review your fee history to identify optimization opportunities." },
          ].map((tip, i) => (
            <div key={i} className="animate-slideUp rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 opacity-0 transition-all hover:border-zinc-700" style={{ animationDelay: `${300 + i * 100}ms`, animationFillMode: "forwards" }}>
              <span className="text-2xl">{tip.icon}</span>
              <p className="mt-2 font-medium text-white">{tip.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{tip.desc}</p>
            </div>
          ))}
        </div>
      </ShimmerCard>
    </div>
  );
}
