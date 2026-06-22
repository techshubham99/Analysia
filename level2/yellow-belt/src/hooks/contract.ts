"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";
import {
  getActiveNetwork,
  getXlmPriceUSD,
  getNetworkFee,
} from "@/lib/stellar";

// ─────────────── Wallet ───────────────

export interface WalletState {
  address: string | null;
  connected: boolean;
  network: "testnet" | "mainnet";
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    connected: false,
    network: "testnet",
  });

  const connect = useCallback(async () => {
    try {
      const connectRes = await isConnected();
      if (!connectRes.isConnected) {
        const accessRes = await requestAccess();
        if (!accessRes) return;
      }
      const addrRes = await getAddress();
      if (addrRes.address) {
        setWallet({
          address: addrRes.address,
          connected: true,
          network: getActiveNetwork(),
        });
      }
    } catch (e) {
      console.error("Wallet connection error:", e);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ address: null, connected: false, network: "testnet" });
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const { isConnected: conn } = await isConnected();
        if (conn) {
          const addrRes = await getAddress();
          if (addrRes.address) {
            setWallet({
              address: addrRes.address,
              connected: true,
              network: getActiveNetwork(),
            });
          }
        }
      } catch {
        // not installed or not connected
      }
    };
    check();
  }, []);

  return { wallet, connect, disconnect };
}

// ─────────────── Generated Typed Client ───────────────
// Import the auto-generated type-safe client from `stellar contract bindings typescript`
// Uses relative path to avoid file: dependency resolution issues on hosting platforms

import * as Contract from "../../packages/contract/src/index";
import { signTransaction } from "@stellar/freighter-api";

const contractNetworks = Contract.networks;
const CONTRACT_ID = contractNetworks.testnet.contractId;

let _client: Contract.Client | null = null;

/** Get or create a typed contract Client instance */
export function getContractClient(rpcUrl?: string): Contract.Client {
  if (!_client) {
    _client = new Contract.Client({
      contractId: CONTRACT_ID,
      networkPassphrase: contractNetworks.testnet.networkPassphrase,
      rpcUrl: rpcUrl || "https://soroban-testnet.stellar.org",
    });
  }
  return _client;
}

/** Sign and send an AssembledTransaction using Freighter */
export async function signAndSend<T>(
  tx: import("contract").contract.AssembledTransaction<T>,
) {
  const signed = await signTransaction(tx.toXDR(), {
    networkPassphrase: contractNetworks.testnet.networkPassphrase,
  });
  return tx.signAndSend({
    signTransaction: () => Promise.resolve(signed),
  });
}

/** Typed wrapper: record a gas fee on-chain */
export async function recordFee(
  network: string,
  baseFee: bigint,
  sequence: number,
) {
  const client = getContractClient();
  const tx = await client.record_fee({ network, base_fee: baseFee, sequence });
  return signAndSend(tx);
}

/** Typed wrapper: set a token price on-chain */
export async function setPrice(token: string, price: bigint) {
  const client = getContractClient();
  const tx = await client.set_price({ token, price });
  return signAndSend(tx);
}

/** Typed wrapper: get recent fees */
export async function getFees(
  network: string,
  limit: number,
): Promise<Contract.GasRecord[]> {
  const client = getContractClient();
  const tx = await client.get_fees({ network, limit });
  return tx.result;
}

/** Typed wrapper: get token price */
export async function getPrice(token: string): Promise<bigint> {
  const client = getContractClient();
  const tx = await client.get_price({ token });
  return tx.result;
}

/** Typed wrapper: get user spending in a time range */
export async function getSpending(
  user: string,
  fromTs: bigint,
  toTs: bigint,
): Promise<bigint> {
  const client = getContractClient();
  const tx = await client.get_spending({ user, from_ts: fromTs, to_ts: toTs });
  return tx.result;
}

/** Typed wrapper: get recent transactions for a user */
export async function getTxs(
  user: string,
  limit: number,
): Promise<Contract.TxRecord[]> {
  const client = getContractClient();
  const tx = await client.get_txs({ user, limit });
  return tx.result;
}

/** Typed wrapper: estimate deployment cost */
export async function getDeployCost(
  codeSize: bigint,
  network: string,
): Promise<bigint> {
  const client = getContractClient();
  const tx = await client.deploy_cost({ code_size: codeSize, network });
  return tx.result;
}

// ─────────────── Gas Fee & Price State ───────────────

export interface FeeData {
  maxFee: string;
  sorobanFee: string;
  xlmPrice: number;
  surge: boolean;
  timestamp: number;
}

export function useGasFeeData() {
  const [feeData, setFeeData] = useState<FeeData>({
    maxFee: "100",
    sorobanFee: "100",
    xlmPrice: 0,
    surge: false,
    timestamp: Date.now(),
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [fees, price] = await Promise.all([
        getNetworkFee(),
        getXlmPriceUSD(),
      ]);
      setFeeData({
        maxFee: fees.maxFee,
        sorobanFee: fees.sorobanFee,
        xlmPrice: price,
        surge: fees.surge,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error("Failed to fetch fee data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const txFeeXLM = parseInt(feeData.sorobanFee) / 10_000_000;
  const txFeeUSD = txFeeXLM * feeData.xlmPrice;

  return { feeData, txFeeXLM, txFeeUSD, loading, refresh };
}

// ─────────────── Analysis Calculations ───────────────

export interface SpendSummary {
  weekly: number;
  monthly: number;
  yearly: number;
  weeklyUSD: number;
  monthlyUSD: number;
  yearlyUSD: number;
  txCount: number;
}

export function calculateSpendSummary(
  txs: { amount: number; timestamp: number }[],
  xlmPrice: number,
): SpendSummary {
  const now = Date.now() / 1000;
  const weekAgo = now - 7 * 24 * 3600;
  const monthAgo = now - 30 * 24 * 3600;
  const yearAgo = now - 365 * 24 * 3600;

  let weekly = 0,
    monthly = 0,
    yearly = 0;

  for (const tx of txs) {
    if (tx.timestamp >= weekAgo) weekly += tx.amount;
    if (tx.timestamp >= monthAgo) monthly += tx.amount;
    if (tx.timestamp >= yearAgo) yearly += tx.amount;
  }

  return {
    weekly: weekly / 10_000_000,
    monthly: monthly / 10_000_000,
    yearly: yearly / 10_000_000,
    weeklyUSD: (weekly / 10_000_000) * xlmPrice,
    monthlyUSD: (monthly / 10_000_000) * xlmPrice,
    yearlyUSD: (yearly / 10_000_000) * xlmPrice,
    txCount: txs.length,
  };
}

export interface SavingsSuggestion {
  reduction: number;
  frequencyLabel: string;
  weeklySave: number;
  monthlySave: number;
  yearlySave: number;
  weeklySaveUSD: number;
  monthlySaveUSD: number;
  yearlySaveUSD: number;
  duration: string;
  totalSaved: number;
  totalSavedUSD: number;
}

export function calculateSavings(
  monthlyFeesXLM: number,
  xlmPrice: number,
): SavingsSuggestion[] {
  const scenarios = [
    { reduction: 5, label: "Reduce 1 tx/week (5%)", duration: "3 months" },
    { reduction: 10, label: "Reduce 2 tx/week (10%)", duration: "6 months" },
    { reduction: 20, label: "Batch transactions (20%)", duration: "1 year" },
    { reduction: 30, label: "Optimize usage (30%)", duration: "1 year" },
  ];

  return scenarios.map((s) => {
    const monthlySave = (monthlyFeesXLM * s.reduction) / 100;
    const weeklySave = monthlySave / 4;
    const yearlySave = monthlySave * 12;
    const totalSaved =
      yearlySave *
      (s.duration === "3 months"
        ? 0.25
        : s.duration === "6 months"
          ? 0.5
          : 1);
    return {
      reduction: s.reduction,
      frequencyLabel: s.label,
      weeklySave,
      monthlySave,
      yearlySave,
      weeklySaveUSD: weeklySave * xlmPrice,
      monthlySaveUSD: monthlySave * xlmPrice,
      yearlySaveUSD: yearlySave * xlmPrice,
      duration: s.duration,
      totalSaved,
      totalSavedUSD: totalSaved * xlmPrice,
    };
  });
}

export interface DeployCostEstimate {
  baseFee: number;
  perByteFee: number;
  totalStroops: number;
  totalXLM: number;
  totalUSD: number;
  withGasXLM: number;
  withGasUSD: number;
  network: string;
}

export function calculateDeployCost(
  codeSizeBytes: number,
  network: "testnet" | "mainnet",
  xlmPrice: number,
): DeployCostEstimate {
  const baseFee = network === "mainnet" ? 500_000_000 : 100_000_000;
  const perByteFee = network === "mainnet" ? 1_000 : 200;
  const totalStroops = baseFee + codeSizeBytes * perByteFee;
  const totalXLM = totalStroops / 10_000_000;
  const gasStroops = network === "mainnet" ? 50_000_000 : 10_000_000;

  return {
    baseFee,
    perByteFee,
    totalStroops,
    totalXLM,
    totalUSD: totalXLM * xlmPrice,
    withGasXLM: (totalStroops + gasStroops) / 10_000_000,
    withGasUSD: ((totalStroops + gasStroops) / 10_000_000) * xlmPrice,
    network,
  };
}
