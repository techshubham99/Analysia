"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import Analysis from "@/components/Analysis";
import Savings from "@/components/Savings";
import DeployCost from "@/components/DeployCost";
import { useWallet } from "@/hooks/contract";
import { setActiveNetwork } from "@/lib/stellar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { wallet, connect, disconnect, setManualAddress, dismissManualInput } = useWallet();

  const handleNetworkChange = useCallback((n: "testnet" | "mainnet") => {
    setActiveNetwork(n);
  }, []);

  return (
    <>
      <Navbar
        wallet={wallet}
        onConnect={connect}
        onDisconnect={disconnect}
        onSetManualAddress={setManualAddress}
        onDismissManualInput={dismissManualInput}
        onNetworkChange={handleNetworkChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 flex-1">
        <div className="transition-all duration-300">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "analysis" && <Analysis />}
          {activeTab === "savings" && <Savings />}
          {activeTab === "deploy" && <DeployCost />}
        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 text-center text-sm text-zinc-600">
        <p>
          StellarGas.Calculator &mdash; Built with Stellar Soroban &amp; Next.js
        </p>
        <p className="mt-1 text-xs">
          Data sourced from Stellar RPC nodes and CoinGecko API. Not financial
          advice.
        </p>
      </footer>
    </>
  );
}
