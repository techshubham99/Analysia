import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StellarGas.Calculator — Real-Time Gas Fee Calculator for Stellar",
  description:
    "Track real-time Stellar network fees, analyze spending weekly/monthly/yearly, get savings suggestions, and estimate contract deployment costs for Soroban smart contracts on testnet and mainnet.",
  keywords: [
    "stellar",
    "soroban",
    "gas fee",
    "calculator",
    "blockchain",
    "xlm",
    "smart contract",
    "deployment cost",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
