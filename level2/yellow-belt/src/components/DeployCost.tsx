"use client";

import { useState, useCallback } from "react";
import { DeployCostEstimate, calculateDeployCost } from "@/hooks/contract";
import { getActiveNetwork } from "@/lib/stellar";
import { formatXLM, formatUSD, readFileAsText } from "@/lib/utils";

interface DeployCostProps {
  xlmPrice: number;
}

export default function DeployCost({ xlmPrice }: DeployCostProps) {
  const [codeInput, setCodeInput] = useState<
    "paste" | "upload" | "size"
  >("size");
  const [codeSize, setCodeSize] = useState<number>(1024);
  const [pastedCode, setPastedCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [estimate, setEstimate] = useState<DeployCostEstimate | null>(null);

  const network = getActiveNetwork();

  const computeSize = useCallback(
    (bytes: number) => {
      const est = calculateDeployCost(bytes, network, xlmPrice);
      setEstimate(est);
    },
    [network, xlmPrice]
  );

  const handlePasteChange = (val: string) => {
    setPastedCode(val);
    const bytes = new TextEncoder().encode(val).length;
    setCodeSize(bytes);
    computeSize(bytes);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await readFileAsText(file);
    setPastedCode(text);
    const bytes = new TextEncoder().encode(text).length;
    setCodeSize(bytes);
    computeSize(bytes);
  };

  const handleSizeChange = (val: number) => {
    setCodeSize(val);
    computeSize(val);
  };

  const handleTabChange = (tab: "paste" | "upload" | "size") => {
    setCodeInput(tab);
    setEstimate(null);
    setPastedCode("");
    setFileName("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Contract Deployment Cost
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Estimate fees for deploying Soroban smart contracts &mdash;{" "}
          {network === "testnet" ? "Testnet" : "Mainnet"}
        </p>
      </div>

      {/* Input method tabs */}
      <div className="flex gap-2">
        {[
          { id: "size" as const, label: "Size Input" },
          { id: "paste" as const, label: "Paste Code" },
          { id: "upload" as const, label: "Upload File" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              codeInput === tab.id
                ? "bg-indigo-600/20 text-indigo-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
        {codeInput === "size" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Contract WASM Size (bytes)
            </label>
            <input
              type="number"
              min={0}
              max={1_000_000}
              value={codeSize}
              onChange={(e) => handleSizeChange(parseInt(e.target.value) || 0)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-lg text-white outline-none focus:border-indigo-500"
            />
            <div className="mt-2 flex gap-4 text-sm text-zinc-500">
              <button
                onClick={() => handleSizeChange(512)}
                className="rounded bg-zinc-800 px-2 py-1 hover:text-zinc-300"
              >
                512 B
              </button>
              <button
                onClick={() => handleSizeChange(1024)}
                className="rounded bg-zinc-800 px-2 py-1 hover:text-zinc-300"
              >
                1 KB
              </button>
              <button
                onClick={() => handleSizeChange(10240)}
                className="rounded bg-zinc-800 px-2 py-1 hover:text-zinc-300"
              >
                10 KB
              </button>
              <button
                onClick={() => handleSizeChange(51200)}
                className="rounded bg-zinc-800 px-2 py-1 hover:text-zinc-300"
              >
                50 KB
              </button>
              <button
                onClick={() => handleSizeChange(102400)}
                className="rounded bg-zinc-800 px-2 py-1 hover:text-zinc-300"
              >
                100 KB
              </button>
            </div>
          </div>
        )}

        {codeInput === "paste" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Paste your Rust contract code
            </label>
            <textarea
              value={pastedCode}
              onChange={(e) => handlePasteChange(e.target.value)}
              rows={10}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-300 outline-none focus:border-indigo-500"
              placeholder='// Paste your Rust contract source code here&#10;// e.g. #![no_std]&#10;use soroban_sdk::{contract, contractimpl, Env, String, Vec};&#10;...'
            />
            {pastedCode && (
              <p className="mt-2 text-sm text-zinc-500">
                Code size: {(codeSize / 1024).toFixed(2)} KB ({codeSize}{" "}
                bytes) &mdash; WASM will be ~2-3x larger after compilation
              </p>
            )}
          </div>
        )}

        {codeInput === "upload" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Upload a .wasm or .rs file
            </label>
            <div className="mt-2">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-8 transition-colors hover:border-indigo-500 hover:bg-zinc-800">
                <svg
                  className="mb-2 h-8 w-8 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className="text-sm text-zinc-400">
                  {fileName || "Click to upload or drag & drop"}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  .wasm or .rs files
                </p>
                <input
                  type="file"
                  accept=".wasm,.rs"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {fileName && (
              <p className="mt-2 text-sm text-zinc-500">
                File: {fileName} &mdash; {codeSize} bytes
              </p>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {estimate && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">
              Cost Estimate Summary
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-zinc-500">Base Fee</p>
                <p className="text-xl font-bold text-white">
                  {(estimate.baseFee / 10_000_000).toFixed(7)} XLM
                </p>
                <p className="text-xs text-zinc-600">
                  {estimate.baseFee.toLocaleString()} stroops
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Per-Byte Fee</p>
                <p className="text-xl font-bold text-white">
                  {(estimate.perByteFee / 10_000_000).toFixed(7)} XLM / byte
                </p>
                <p className="text-xs text-zinc-600">
                  {estimate.perByteFee} stroops/byte
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Code Size</p>
                <p className="text-xl font-bold text-white">
                  {(codeSize / 1024).toFixed(2)} KB
                </p>
                <p className="text-xs text-zinc-600">
                  {codeSize.toLocaleString()} bytes
                </p>
              </div>
            </div>
          </div>

          {/* Total cost */}
          <div
            className={`rounded-xl border p-6 backdrop-blur ${
              estimate.network === "testnet"
                ? "border-emerald-600/20 bg-emerald-600/5"
                : "border-amber-600/20 bg-amber-600/5"
            }`}
          >
            <h2 className="text-lg font-semibold text-white">Total Cost</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-zinc-400">Without Gas</p>
                <p className="text-2xl font-bold text-white">
                  {formatXLM(estimate.totalXLM)}
                </p>
                <p className="text-sm text-zinc-500">
                  {formatUSD(estimate.totalUSD)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">
                  With Estimated Gas (+10%)
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatXLM(estimate.withGasXLM)}
                </p>
                <p className="text-sm text-zinc-500">
                  {formatUSD(estimate.withGasUSD)}
                </p>
              </div>
            </div>
          </div>

          {/* Network comparison */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Cross-Network Comparison</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Same contract on the other network
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-zinc-500">If deployed on Testnet</p>
                {(() => {
                  const t = calculateDeployCost(codeSize, "testnet", xlmPrice);
                  return (
                    <>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatXLM(t.totalXLM)}
                      </p>
                      <p className="text-xs text-zinc-600">{formatUSD(t.totalUSD)}</p>
                    </>
                  );
                })()}
              </div>
              <div>
                <p className="text-sm text-zinc-500">If deployed on Mainnet</p>
                {(() => {
                  const m = calculateDeployCost(codeSize, "mainnet", xlmPrice);
                  return (
                    <>
                      <p className="text-xl font-bold text-amber-400">
                        {formatXLM(m.totalXLM)}
                      </p>
                      <p className="text-xs text-zinc-600">{formatUSD(m.totalUSD)}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden backdrop-blur">
            <h3 className="px-6 pt-4 text-sm font-semibold text-zinc-400">
              Fee Breakdown
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="px-6 py-3 font-medium">Component</th>
                    <th className="px-6 py-3 font-medium">Stroops</th>
                    <th className="px-6 py-3 font-medium">XLM</th>
                    <th className="px-6 py-3 font-medium">USD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr className="text-zinc-300">
                    <td className="px-6 py-3">Base Fee</td>
                    <td className="px-6 py-3">
                      {estimate.baseFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {(estimate.baseFee / 10_000_000).toFixed(7)}
                    </td>
                    <td className="px-6 py-3">
                      {formatUSD(
                        (estimate.baseFee / 10_000_000) * xlmPrice
                      )}
                    </td>
                  </tr>
                  <tr className="text-zinc-300">
                    <td className="px-6 py-3">
                      Code Fee ({codeSize} bytes &times;{" "}
                      {estimate.perByteFee} stroops)
                    </td>
                    <td className="px-6 py-3">
                      {(codeSize * estimate.perByteFee).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {((codeSize * estimate.perByteFee) / 10_000_000).toFixed(
                        7
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {formatUSD(
                        ((codeSize * estimate.perByteFee) / 10_000_000) *
                          xlmPrice
                      )}
                    </td>
                  </tr>
                  <tr className="font-medium text-white">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3">
                      {estimate.totalStroops.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {formatXLM(estimate.totalXLM)}
                    </td>
                    <td className="px-6 py-3">
                      {formatUSD(estimate.totalUSD)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500 backdrop-blur">
        <strong>Note:</strong> These are estimates. Actual costs may vary based
        on network congestion, contract complexity, and computation fees. The
        estimate includes storage rent for 30 days of TTL. Deployment costs on{" "}
        <span className="text-zinc-300">testnet</span> are significantly lower
        than <span className="text-zinc-300">mainnet</span>.
      </div>
    </div>
  );
}
