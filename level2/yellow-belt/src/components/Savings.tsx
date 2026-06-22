"use client";

import { SavingsSuggestion } from "@/hooks/contract";
import { formatXLM, formatUSD } from "@/lib/utils";

interface SavingsProps {
  suggestions: SavingsSuggestion[];
  monthlyFees: number;
  xlmPrice: number;
  walletAddress: string | null;
}

export default function Savings({
  suggestions,
  monthlyFees,
  xlmPrice,
  walletAddress,
}: SavingsProps) {
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
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">
            Connect Wallet for Savings
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Connect your Freighter wallet to get personalized savings suggestions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Savings Suggestions</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Optimize your Stellar transaction costs
        </p>
      </div>

      {/* Current spending */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Your Current Spend</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-zinc-500">Monthly Fees</p>
            <p className="text-2xl font-bold text-white">
              {formatXLM(monthlyFees)}
            </p>
            <p className="text-sm text-zinc-500">
              {formatUSD(monthlyFees * xlmPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Yearly Fees</p>
            <p className="text-2xl font-bold text-white">
              {formatXLM(monthlyFees * 12)}
            </p>
            <p className="text-sm text-zinc-500">
              {formatUSD(monthlyFees * 12 * xlmPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Savings scenarios */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Savings Scenarios
        </h2>
        {suggestions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center backdrop-blur">
            <p className="text-zinc-400">
              Record transactions to see savings suggestions
            </p>
          </div>
        ) : (
          suggestions.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} index={i} />
          ))
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-emerald-600/20 bg-emerald-600/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-emerald-400">
          💡 Pro Tips
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-400">•</span>
            <span>
              <strong className="text-white">Batch transactions</strong> &mdash;
              Combine multiple operations into a single transaction to save on
              base fees.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-400">•</span>
            <span>
              <strong className="text-white">Off-peak timing</strong> &mdash;
              Execute transactions during lower network activity to get lower
              fees.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-400">•</span>
            <span>
              <strong className="text-white">Use testnet</strong> &mdash;
              For development and testing, always use testnet where fees are
              ~80% cheaper.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-400">•</span>
            <span>
              <strong className="text-white">Contract optimization</strong>
              &mdash; Smaller contract WASM files cost less to deploy and
              execute.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  index,
}: {
  suggestion: SavingsSuggestion;
  index: number;
}) {
  const colors = [
    "border-blue-600/20 bg-blue-600/5",
    "border-indigo-600/20 bg-indigo-600/5",
    "border-purple-600/20 bg-purple-600/5",
    "border-pink-600/20 bg-pink-600/5",
  ];

  return (
    <div
      className={`rounded-xl border p-6 backdrop-blur ${colors[index % colors.length]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {suggestion.frequencyLabel}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Over {suggestion.duration}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-600/20 px-3 py-1 text-sm font-medium text-emerald-400">
          Save {suggestion.reduction}%
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">Weekly Savings</p>
          <p className="text-base font-bold text-white">
            {formatXLM(suggestion.weeklySave)}
          </p>
          <p className="text-xs text-zinc-500">
            {formatUSD(suggestion.weeklySaveUSD)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Monthly Savings</p>
          <p className="text-base font-bold text-white">
            {formatXLM(suggestion.monthlySave)}
          </p>
          <p className="text-xs text-zinc-500">
            {formatUSD(suggestion.monthlySaveUSD)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-zinc-500">Total Saved</p>
          <p className="text-base font-bold text-emerald-400">
            {formatXLM(suggestion.totalSaved)}
          </p>
          <p className="text-xs text-zinc-500">
            {formatUSD(suggestion.totalSavedUSD)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Progress toward savings goal</span>
          <span>{suggestion.reduction}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${suggestion.reduction}%` }}
          />
        </div>
      </div>
    </div>
  );
}
