"use client";

import { useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import Analysis from "@/components/Analysis";
import Savings from "@/components/Savings";
import DeployCost from "@/components/DeployCost";
import {
  useWallet,
  useGasFeeData,
  calculateSpendSummary,
  calculateSavings,
} from "@/hooks/contract";
import { setActiveNetwork } from "@/lib/stellar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { wallet, connect, disconnect } = useWallet();
  const { feeData, txFeeXLM, txFeeUSD, loading, refresh } = useGasFeeData();

  const handleNetworkChange = useCallback((n: "testnet" | "mainnet") => {
    setActiveNetwork(n);
    refresh();
  }, [refresh]);

  // Simulated transactions (in real app, these come from the contract)
  const sampleTxs = useMemo(() => {
    const now = Date.now() / 1000;
    const txs = [];
    // Generate realistic sample data for the past 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.random() * 30;
      txs.push({
        amount: Math.floor(50000 + Math.random() * 500000),
        timestamp: now - daysAgo * 86400,
      });
    }
    return txs;
  }, []);

  const spendSummary = useMemo(
    () => calculateSpendSummary(sampleTxs, feeData.xlmPrice),
    [sampleTxs, feeData.xlmPrice]
  );

  const monthlyFeesXLM = useMemo(
    () => (spendSummary ? spendSummary.monthly : 0),
    [spendSummary]
  );

  const savingsSuggestions = useMemo(
    () => calculateSavings(monthlyFeesXLM, feeData.xlmPrice),
    [monthlyFeesXLM, feeData.xlmPrice]
  );

  return (
    <>
      <Navbar
        wallet={wallet}
        onConnect={connect}
        onDisconnect={disconnect}
        onNetworkChange={handleNetworkChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1">
        {activeTab === "dashboard" && (
          <Dashboard
            feeData={feeData}
            txFeeXLM={txFeeXLM}
            txFeeUSD={txFeeUSD}
            loading={loading}
            onRefresh={refresh}
            walletAddress={wallet.address}
          />
        )}

        {activeTab === "analysis" && (
          <Analysis
            summary={spendSummary}
            xlmPrice={feeData.xlmPrice}
            walletAddress={wallet.address}
            loading={loading}
          />
        )}

        {activeTab === "savings" && (
          <Savings
            suggestions={savingsSuggestions}
            monthlyFees={monthlyFeesXLM}
            xlmPrice={feeData.xlmPrice}
            walletAddress={wallet.address}
          />
        )}

        {activeTab === "deploy" && (
          <DeployCost xlmPrice={feeData.xlmPrice} />
        )}
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
