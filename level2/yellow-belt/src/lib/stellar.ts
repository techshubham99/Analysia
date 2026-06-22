import { rpc } from "@stellar/stellar-sdk";

export const RPC_URLS = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://soroban.stellar.org",
};

export const NETWORK_PASSPHRASES = {
  testnet: "Test SDF Network ; September 2015",
  mainnet: "Public Global Stellar Network ; September 2015",
};

let activeNetwork: "testnet" | "mainnet" = "testnet";

export function getActiveNetwork() {
  return activeNetwork;
}

export function setActiveNetwork(n: "testnet" | "mainnet") {
  activeNetwork = n;
}

export function getRpcUrl() {
  return RPC_URLS[activeNetwork];
}

export function getNetworkPassphrase() {
  return NETWORK_PASSPHRASES[activeNetwork];
}

export function createServer() {
  return new rpc.Server(getRpcUrl());
}

interface FeeStatsResponse {
  soroban_inclusion_fee: { max: string; min: string; mode: string };
  fee_charged: { max: string; min: string; mode: string };
  latest_ledger: string;
  last_ledger: string;
}

/**
 * Get the current recommended fee from the Stellar network
 * Returns in stroops (1 XLM = 10_000_000 stroops)
 */
export async function getNetworkFee(): Promise<{
  maxFee: string;
  sorobanFee: string;
  surge: boolean;
}> {
  try {
    const res = await fetch(`${getRpcUrl()}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getFeeStats",
      }),
    });
    const json = await res.json();
    const result: FeeStatsResponse = json.result;
    return {
      maxFee: result.fee_charged.max,
      sorobanFee: result.soroban_inclusion_fee.max,
      surge: result.latest_ledger === result.last_ledger,
    };
  } catch (e) {
    console.error("Failed to fetch fee stats:", e);
    return { maxFee: "100", sorobanFee: "100", surge: false };
  }
}

/**
 * Fetch XLM price in USD from CoinGecko
 */
export async function getXlmPriceUSD(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd",
    );
    const data = await res.json();
    return data.stellar?.usd || 0;
  } catch {
    return 0;
  }
}
