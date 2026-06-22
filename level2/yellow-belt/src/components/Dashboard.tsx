"use client";

import { FeeData } from "@/hooks/contract";
import { getActiveNetwork } from "@/lib/stellar";
import { formatXLM, formatUSD } from "@/lib/utils";

interface DashboardProps {
  feeData: FeeData;
  txFeeXLM: number;
  txFeeUSD: number;
  loading: boolean;
  onRefresh: () => void;
  walletAddress: string | null;
}

export default function Dashboard({
  feeData,
  txFeeXLM,
  txFeeUSD,
  loading,
  onRefresh,
  walletAddress,
}: DashboardProps) {
  const network = getActiveNetwork();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Gas Tracker</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Live Stellar network fees &mdash; {network === "testnet" ? "Testnet" : "Mainnet"}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-all hover:bg-zinc-700 disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Main fee cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Base Fee Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">
              {network === "testnet" ? "Testnet" : "Mainnet"} Soroban Fee
            </p>
            {feeData.surge && (
              <span className="rounded-full bg-amber-600/20 px-2 py-0.5 text-xs text-amber-400">
                Surge
              </span>
            )}
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {loading ? "…" : parseInt(feeData.sorobanFee).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-zinc-500">stroops</p>
          <div className="mt-3 space-y-1 border-t border-zinc-800 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">≈ XLM</span>
              <span className="text-zinc-300">
                {loading ? "…" : formatXLM(txFeeXLM)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">≈ USD</span>
              <span className="text-zinc-300">
                {loading ? "…" : formatUSD(txFeeUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* XLM Price Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
          <p className="text-sm font-medium text-zinc-400">XLM / USD Price</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {loading ? "…" : feeData.xlmPrice > 0 ? `$${feeData.xlmPrice.toFixed(6)}` : "N/A"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">CoinGecko (30s refresh)</p>
          <div className="mt-3 border-t border-zinc-800 pt-3 text-sm text-zinc-500">
            Market price for Stellar (XLM)
          </div>
        </div>

        {/* Max Fee Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
          <p className="text-sm font-medium text-zinc-400">Network Max Fee</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {loading ? "…" : parseInt(feeData.maxFee).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-zinc-500">stroops</p>
          <div className="mt-3 border-t border-zinc-800 pt-3 text-sm text-zinc-500">
            <span className="text-zinc-400">
              ≈ {(parseInt(feeData.maxFee) / 10_000_000).toFixed(7)} XLM
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-zinc-500">Est. Tx Cost (XLM)</p>
            <p className="mt-1 text-xl font-bold text-white">
              {loading ? "…" : formatXLM(txFeeXLM)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Est. Tx Cost (USD)</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              {loading ? "…" : formatUSD(txFeeUSD)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">1M Stroops ≈ XLM</p>
            <p className="mt-1 text-xl font-bold text-white">0.1 XLM</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Wallet Status</p>
            <p className="mt-1 text-xl font-bold text-white">
              {walletAddress ? (
                <span className="text-emerald-400">Connected</span>
              ) : (
                <span className="text-zinc-500">Not Connected</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-amber-600/20 bg-amber-600/5 p-4 text-sm text-amber-400">
        <strong>ℹ</strong> Fees shown are from the Stellar network RPC. Soroban
        transaction fees vary by computational complexity. The values above
        represent the current recommended fee. Connect your wallet to track your
        personal spending.
      </div>
    </div>
  );
}
