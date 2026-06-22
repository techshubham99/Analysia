"use client";

import { SpendSummary } from "@/hooks/contract";
import { formatXLM, formatUSD, formatCompact } from "@/lib/utils";

interface AnalysisProps {
  summary: SpendSummary | null;
  xlmPrice: number;
  walletAddress: string | null;
  loading: boolean;
}

export default function Analysis({
  summary,
  xlmPrice,
  walletAddress,
  loading,
}: AnalysisProps) {
  if (!walletAddress) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <svg
              className="h-8 w-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">No Wallet Connected</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Connect your Freighter wallet to analyze your spending
          </p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-400">Loading spending data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Spending Analysis</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your transaction fee breakdown &mdash; tracking{" "}
          <span className="text-white">{summary.txCount} transactions</span>
        </p>
      </div>

      {/* Period cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <PeriodCard
          period="Weekly"
          xlm={summary.weekly}
          usd={summary.weeklyUSD}
          color="text-blue-400"
          border="border-blue-600/20"
          bg="bg-blue-600/5"
        />
        <PeriodCard
          period="Monthly"
          xlm={summary.monthly}
          usd={summary.monthlyUSD}
          color="text-indigo-400"
          border="border-indigo-600/20"
          bg="bg-indigo-600/5"
        />
        <PeriodCard
          period="Yearly"
          xlm={summary.yearly}
          usd={summary.yearlyUSD}
          color="text-purple-400"
          border="border-purple-600/20"
          bg="bg-purple-600/5"
        />
      </div>

      {/* Comparison chart (bar chart style) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Fee Comparison
        </h2>
        <div className="space-y-4">
          <BarRow
            label="Weekly"
            value={summary.weekly}
            max={summary.yearly || 1}
            color="bg-blue-500"
          />
          <BarRow
            label="Monthly"
            value={summary.monthly}
            max={summary.yearly || 1}
            color="bg-indigo-500"
          />
          <BarRow
            label="Yearly"
            value={summary.yearly}
            max={summary.yearly || 1}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* USD Value */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
        <h2 className="mb-1 text-lg font-semibold text-white">USD Value</h2>
        <p className="mb-4 text-sm text-zinc-500">
          At current XLM price of ${xlmPrice.toFixed(6)}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-zinc-500">Weekly</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatUSD(summary.weeklyUSD)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Monthly</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatUSD(summary.monthlyUSD)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Yearly</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatUSD(summary.yearlyUSD)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction count */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Transaction Volume</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Total tracked: {summary.txCount} transactions
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Average fee per tx:{" "}
          {summary.txCount > 0
            ? formatXLM(summary.yearly / summary.txCount)
            : "0 XLM"}
        </p>
      </div>
    </div>
  );
}

function PeriodCard({
  period,
  xlm,
  usd,
  color,
  border,
  bg,
}: {
  period: string;
  xlm: number;
  usd: number;
  color: string;
  border: string;
  bg: string;
}) {
  return (
    <div
      className={`rounded-xl border p-6 backdrop-blur ${border} ${bg}`}
    >
      <p className="text-sm font-medium text-zinc-400">{period} Fees</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {formatCompact(xlm)} <span className="text-sm text-zinc-500">XLM</span>
      </p>
      <p className="mt-1 text-sm text-zinc-500">{formatUSD(usd)}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{formatCompact(value)} XLM</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}
