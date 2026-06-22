"use client";

import { WalletState } from "@/hooks/contract";
import { setActiveNetwork, getActiveNetwork } from "@/lib/stellar";
import { truncateAddress } from "@/lib/utils";
import { useState } from "react";

interface NavbarProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onSetManualAddress: (address: string) => void;
  onDismissManualInput: () => void;
  onNetworkChange: (n: "testnet" | "mainnet") => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "analysis", label: "Analysis", icon: "📈" },
  { id: "savings", label: "Savings", icon: "💰" },
  { id: "deploy", label: "Deploy Cost", icon: "🚀" },
];

export default function Navbar({
  wallet,
  onConnect,
  onDisconnect,
  onSetManualAddress,
  onDismissManualInput,
  onNetworkChange,
  activeTab,
  onTabChange,
}: NavbarProps) {
  const [connecting, setConnecting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [manualAddr, setManualAddr] = useState("");

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect();
    } finally {
      setConnecting(false);
    }
  };

  const handleNetworkToggle = () => {
    const newNetwork =
      getActiveNetwork() === "testnet" ? "mainnet" : "testnet";
    setActiveNetwork(newNetwork);
    onNetworkChange(newNetwork);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetManualAddress(manualAddr.trim());
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/20">
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
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">StellarGas</span>
            <span className="hidden text-lg font-bold text-indigo-400 sm:inline">
              .Calculator
            </span>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden items-center gap-1 md:flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-indigo-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {activeTab === tab.id && (
                <span className="absolute inset-0 rounded-lg bg-indigo-600/10" />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Network toggle */}
          <button
            onClick={handleNetworkToggle}
            className="group relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105"
          >
            <span
              className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                getActiveNetwork() === "testnet"
                  ? "bg-emerald-600/20 group-hover:bg-emerald-600/30"
                  : "bg-amber-600/20 group-hover:bg-amber-600/30"
              }`}
            />
            <span
              className={`relative h-2 w-2 animate-pulse rounded-full ${
                getActiveNetwork() === "testnet"
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span
              className={`relative ${
                getActiveNetwork() === "testnet"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {getActiveNetwork() === "testnet" ? "Testnet" : "Mainnet"}
            </span>
          </button>

          {/* Wallet area */}
          {wallet.connected ? (
            <div className="flex animate-fadeIn items-center gap-2">
              <div className="hidden rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 transition-all sm:block hover:bg-zinc-800">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                {truncateAddress(wallet.address!)}
              </div>
              <button
                onClick={onDisconnect}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-300"
              >
                Disconnect
              </button>
            </div>
          ) : wallet.showManualInput ? (
            /* Manual address input (Freighter failed or not installed) */
            <form onSubmit={handleManualSubmit} className="flex animate-fadeIn items-center gap-2">
              <input
                type="text"
                value={manualAddr}
                onChange={(e) => setManualAddr(e.target.value)}
                placeholder="G... (paste your address)"
                className="w-52 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-600"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-indigo-500"
              >
                Use
              </button>
              <button
                type="button"
                onClick={onDismissManualInput}
                className="rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="relative">
              {/* Error tooltip */}
              {wallet.error && !connecting && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-72 animate-slideUp rounded-lg bg-red-600/10 p-3 text-xs text-red-400 shadow-lg backdrop-blur"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <div>
                      <p className="whitespace-pre-wrap">{wallet.error}</p>
                      <button
                        onClick={handleConnect}
                        className="mt-1.5 text-indigo-400 underline hover:text-indigo-300"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-600/25 disabled:opacity-50 disabled:hover:scale-100"
              >
                {connecting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-lg p-2 text-zinc-400 md:hidden hover:bg-zinc-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showMobileMenu ? "max-h-64 border-t border-zinc-800" : "max-h-0"
        } md:hidden`}
      >
        <div className="grid grid-cols-2 gap-1 px-4 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setShowMobileMenu(false);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
