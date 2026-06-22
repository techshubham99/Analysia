"use client";

import { WalletState } from "@/hooks/contract";
import { setActiveNetwork, getActiveNetwork } from "@/lib/stellar";
import { truncateAddress } from "@/lib/utils";
import { useState } from "react";

interface NavbarProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onNetworkChange: (n: "testnet" | "mainnet") => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analysis", label: "Analysis" },
  { id: "savings", label: "Savings" },
  { id: "deploy", label: "Deploy Cost" },
];

export default function Navbar({
  wallet,
  onConnect,
  onDisconnect,
  onNetworkChange,
  activeTab,
  onTabChange,
}: NavbarProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect();
    } finally {
      setConnecting(false);
    }
  };

  const handleNetworkToggle = () => {
    const newNetwork = getActiveNetwork() === "testnet" ? "mainnet" : "testnet";
    setActiveNetwork(newNetwork);
    onNetworkChange(newNetwork);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">
            StellarGas<span className="text-indigo-400">.Calculator</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="hidden items-center gap-1 md:flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Network toggle */}
          <button
            onClick={handleNetworkToggle}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              getActiveNetwork() === "testnet"
                ? "bg-emerald-600/20 text-emerald-400"
                : "bg-amber-600/20 text-amber-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                getActiveNetwork() === "testnet"
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            {getActiveNetwork() === "testnet" ? "Testnet" : "Mainnet"}
          </button>

          {/* Wallet */}
          {wallet.connected ? (
            <div className="flex items-center gap-2">
              <div className="hidden rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 sm:block">
                {truncateAddress(wallet.address!)}
              </div>
              <button
                onClick={onDisconnect}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-1 border-t border-zinc-800 px-4 py-2 md:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-zinc-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
