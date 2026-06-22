/**
 * Format a timestamp to a human-readable date string
 */
export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format XLM amount with proper decimals
 */
export function formatXLM(amount: number): string {
  if (amount === 0) return "0 XLM";
  if (amount < 0.00001) return "< 0.00001 XLM";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }) + " XLM";
}

/**
 * Format USD amount
 */
export function formatUSD(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "< $0.01";
  return (
    "$" +
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format a large number with abbreviations
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(2);
}

/**
 * Truncate a Stellar address for display
 */
export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Stellar address validation (basic)
 */
export function isValidStellarAddress(addr: string): boolean {
  return /^[G][A-Z0-9]{55}$/i.test(addr);
}

/**
 * Class name merger (simplified cn)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
