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
  freighterDetected: boolean;
  error: string | null;
  /** When true, shows a manual address input field */
  showManualInput: boolean;
}

/** Run a promise with a timeout. Rejects if it doesn't settle within ms. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Check if Freighter extension is injected into the page.
 *  Freighter's content script sets `window.freighter` to a boolean. */
function isFreighterInstalled(): boolean {
  if (typeof window === "undefined") return false;
  // Direct flag set by Freighter content script
  if ((window as any).freighter !== undefined) return true;
  // Check freighterApi as a backup detection method
  if ((window as any).freighterApi !== undefined) return true;
  // Check if the stellar namespace exists (older versions)
  if ((window as any).stellar?.freighter) return true;
  return false;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    connected: false,
    network: "testnet",
    freighterDetected: false,
    error: null,
    showManualInput: false,
  });

  /** Attempt to connect the Freighter wallet.
   *  Never throws — all errors returned via `error` field. */
  const connect = useCallback(async () => {
    console.log("[Wallet] Connect requested");
    setWallet((prev) => ({ ...prev, error: null, showManualInput: false }));

    // 1. Must be browser
    if (typeof window === "undefined") {
      setWallet((prev) => ({
        ...prev,
        error: "Wallet connection is only available in a browser.",
      }));
      return;
    }

    // 2. Check Freighter is installed
    const installed = isFreighterInstalled();
    console.log("[Wallet] Freighter installed:", installed);
    console.log("[Wallet] window.freighter:", (window as any).freighter);
    console.log("[Wallet] window.freighterApi:", (window as any).freighterApi);

    if (!installed) {
      setWallet((prev) => ({
        ...prev,
        error: "Freighter not detected. Please install the Freighter browser extension, then refresh the page.",
        showManualInput: true,
      }));
      return;
    }
    setWallet((prev) => ({ ...prev, freighterDetected: true }));

    // 3. Try isConnected first (checks window.freighter flag fast, or falls back to postMessage with 2s timeout)
    try {
      const connRes = await withTimeout(isConnected(), 5000, "isConnected");
      console.log("[Wallet] isConnected result:", connRes);
      if (connRes.isConnected) {
        // Already connected — get the address
        const addrRes = await withTimeout(getAddress(), 5000, "getAddress");
        console.log("[Wallet] getAddress result:", addrRes);
        if (addrRes.address) {
          setWallet({
            address: addrRes.address,
            connected: true,
            network: getActiveNetwork(),
            freighterDetected: true,
            error: null,
            showManualInput: false,
          });
          return;
        }
      }
    } catch (e) {
      console.warn("[Wallet] isConnected/getAddress failed:", e);
      // Fall through to requestAccess
    }

    // 4. Not connected — request access (prompts the Freighter popup)
    try {
      console.log("[Wallet] Calling requestAccess...");
      const accessRes = await withTimeout(requestAccess(), 30000, "requestAccess");
      console.log("[Wallet] requestAccess result:", accessRes);

      if (accessRes.address) {
        setWallet({
          address: accessRes.address,
          connected: true,
          network: getActiveNetwork(),
          freighterDetected: true,
          error: null,
          showManualInput: false,
        });
        return;
      }

      // Error from Freighter
      const errMsg = accessRes.error?.message || "Could not connect. Freighter may not be unlocked or the request was rejected.";
      console.warn("[Wallet] requestAccess error:", errMsg);
      setWallet((prev) => ({
        ...prev,
        error: errMsg,
        showManualInput: true,
      }));
    } catch (e: any) {
      console.error("[Wallet] requestAccess threw:", e);
      setWallet((prev) => ({
        ...prev,
        error: e?.message || "Freighter did not respond. Make sure Freighter is unlocked and try again.",
        showManualInput: true,
      }));
    }
  }, []);

  /** Allow user to manually enter their wallet address (bypass Freighter auto-connect) */
  const setManualAddress = useCallback((address: string) => {
    if (address.length !== 56 || !address.startsWith("G")) {
      setWallet((prev) => ({
        ...prev,
        error: "Invalid Stellar address. It should start with 'G' and be 56 characters long.",
      }));
      return;
    }
    setWallet({
      address,
      connected: true,
      network: getActiveNetwork(),
      freighterDetected: wallet.freighterDetected,
      error: null,
      showManualInput: false,
    });
  }, [wallet.freighterDetected]);

  const dismissManualInput = useCallback(() => {
    setWallet((prev) => ({ ...prev, showManualInput: false, error: null }));
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      connected: false,
      network: "testnet",
      freighterDetected: true,
      error: null,
      showManualInput: false,
    });
  }, []);

  // On mount, auto-detect and try to silently reconnect
  useEffect(() => {
    const installed = isFreighterInstalled();
    setWallet((prev) => ({ ...prev, freighterDetected: installed }));
    console.log("[Wallet] Mounted, Freighter installed:", installed);

    if (!installed) return;

    const autoConnect = async () => {
      try {
        const connRes = await withTimeout(isConnected(), 5000, "autoConnect");
        if (connRes.isConnected) {
          const addrRes = await withTimeout(getAddress(), 5000, "autoGetAddress");
          if (addrRes.address) {
            console.log("[Wallet] Auto-connected:", addrRes.address);
            setWallet({
              address: addrRes.address,
              connected: true,
              network: getActiveNetwork(),
              freighterDetected: true,
              error: null,
              showManualInput: false,
            });
          }
        }
      } catch (e) {
        // Silent fail — user can click Connect button
        console.warn("[Wallet] Auto-connect skipped:", e);
      }
    };
    autoConnect();
  }, []);

  return { wallet, connect, disconnect, setManualAddress, dismissManualInput };
}

// ─────────────── Generated Typed Client ───────────────
// Uses relative import to avoid package resolution issues on hosting platforms

import * as Contract from "../../packages/contract/src/index";
import { signTransaction } from "@stellar/freighter-api";

const contractNetworks = Contract.networks;
const CONTRACT_ID = contractNetworks.testnet.contractId;

let _client: Contract.Client | null = null;

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

export async function signAndSend<T>(
  tx: Contract.contract.AssembledTransaction<T>,
) {
  const signed = await signTransaction(tx.toXDR(), {
    networkPassphrase: contractNetworks.testnet.networkPassphrase,
  });
  return tx.signAndSend({
    signTransaction: () => Promise.resolve(signed),
  });
}

export async function recordFee(
  network: string,
  baseFee: bigint,
  sequence: number,
) {
  const client = getContractClient();
  const tx = await client.record_fee({ network, base_fee: baseFee, sequence });
  return signAndSend(tx);
}

export async function setPrice(token: string, price: bigint) {
  const client = getContractClient();
  const tx = await client.set_price({ token, price });
  return signAndSend(tx);
}

export async function getFees(
  network: string,
  limit: number,
): Promise<Contract.GasRecord[]> {
  const client = getContractClient();
  const tx = await client.get_fees({ network, limit });
  return tx.result;
}

export async function getPrice(token: string): Promise<bigint> {
  const client = getContractClient();
  const tx = await client.get_price({ token });
  return tx.result;
}

export async function getSpending(
  user: string,
  fromTs: bigint,
  toTs: bigint,
): Promise<bigint> {
  const client = getContractClient();
  const tx = await client.get_spending({ user, from_ts: fromTs, to_ts: toTs });
  return tx.result;
}

export async function getTxs(
  user: string,
  limit: number,
): Promise<Contract.TxRecord[]> {
  const client = getContractClient();
  const tx = await client.get_txs({ user, limit });
  return tx.result;
}

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
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } catch (e: any) {
      console.error("Failed to fetch fee data:", e);
      setError(e?.message || "Failed to fetch fees");
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

  return { feeData, txFeeXLM, txFeeUSD, loading, error, refresh };
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

// ─────────────── Real-Time Calculator ───────────────

export interface TxCalculation {
  txType: string;
  baseFeeStroops: number;
  feeXLM: number;
  feeUSD: number;
  gasXLM: number;
  gasUSD: number;
  totalXLM: number;
  totalUSD: number;
}

export function calculateTxCost(
  txType: string,
  sorobanFee: string,
  xlmPrice: number,
): TxCalculation {
  const baseStroops = parseInt(sorobanFee);
  const multiplier =
    txType === "simple" ? 1 : txType === "swap" ? 3 : txType === "contract" ? 5 : 2;
  const totalStroops = baseStroops * multiplier;
  const feeXLM = totalStroops / 10_000_000;
  const gasXLM = feeXLM * 0.1;
  return {
    txType,
    baseFeeStroops: totalStroops,
    feeXLM,
    feeUSD: feeXLM * xlmPrice,
    gasXLM,
    gasUSD: gasXLM * xlmPrice,
    totalXLM: feeXLM + gasXLM,
    totalUSD: (feeXLM + gasXLM) * xlmPrice,
  };
}
