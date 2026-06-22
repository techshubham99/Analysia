# StellarGas.Calculator ⚡

> **Real-time gas fee calculator for the Stellar network.** Track fees, analyze spending, get savings suggestions, and estimate Soroban contract deployment costs.

[![Contract Tests](https://img.shields.io/badge/Tests-12%20✓-brightgreen)](contract/)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)](level2/yellow-belt/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

---

## Project Structure 📁

```
project/
├── contract/                    # ⚙️ Soroban Smart Contract (Rust)
│   ├── Cargo.toml
│   └── contracts/contract/src/
│       ├── lib.rs               # 9 functions: fees, spending, prices, deploy cost
│       └── test.rs              # 12 comprehensive tests
│
├── level2/yellow-belt/          # 🟡 Enhanced Frontend (Next.js)
│   ├── src/
│   │   ├── app/                 # Next.js App Router (page, layout, globals)
│   │   ├── components/          # 5 components: Navbar, Dashboard, Analysis, Savings, DeployCost
│   │   ├── hooks/               # Wallet, fees, calculations, contract typed wrappers
│   │   └── lib/                 # Stellar RPC, utils, formatting
│   ├── packages/contract/       # Auto-generated TypeScript bindings
│   ├── render.yaml              # Render.com blueprint (free deploy)
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── nginx.conf               # Production nginx config
│   └── next.config.ts           # Static export config
│
└── README.md                    # ← You are here
```

---

## ✅ Current Status

| Component | Status |
|---|---|
| Soroban Contract | ✅ 12/12 tests passing |
| Contract deployed (testnet) | ✅ `CBVLE4GF7EHU7C2VZOXIPYHLA3QGLSF6ZJXCR5K5OFSAIKEEKRDO5JNG` |
| TypeScript bindings | ✅ Generated, typed, integrated |
| Frontend build | ✅ Zero TypeScript errors |
| Wallet integration | ✅ Freighter connect/disconnect |
| Live fee tracking | ✅ RPC + CoinGecko (30s refresh) |
| Spending analysis | ✅ Weekly / Monthly / Yearly |
| Savings suggestions | ✅ 4 scenarios with projections |
| Deploy cost estimator | ✅ Paste, Upload, Size input |
| Cross-network compare | ✅ Testnet vs Mainnet |
| Render deployment | ✅ `render.yaml` blueprint |
| Docker deployment | ✅ Multi-stage Dockerfile |

---

## 🚀 Free Deployment on Render

### One-Click (render.yaml)

This project includes a `render.yaml` blueprint. Connect your GitHub repo to Render:

1. Push to GitHub:
   ```bash
   git init && git add . && git commit -m "initial"
   gh repo create stellargas-calculator --public --push
   ```

2. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint**

3. Select your repo — Render auto-detects `render.yaml`

4. Click **Apply** — done in ~2 minutes.

### Manual Static Site (Free)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Static Site**
2. Connect your GitHub repo
3. Configure:

   | Field | Value |
   |---|---|
   | **Name** | `stellargas-calculator` |
   | **Branch** | `main` |
   | **Build Command** | `cd level2/yellow-belt && bun install && bun run build` |
   | **Publish Directory** | `level2/yellow-belt/out` |

4. Click **Create Static Site** — free HTTPS URL provided (e.g. `https://stellargas-calculator.onrender.com`)

> ⚡ Render free tier: 100 GB bandwidth/month, auto HTTPS, global CDN.

---

## Quick Local Start

```bash
# 1. Contract tests
cd contract && cargo test

# 2. Build contract
stellar contract build

# 3. Deploy (one-time)
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source-account dev --network testnet

# 4. Start frontend
cd level2/yellow-belt && bun install && bun run dev
# → http://localhost:3000
```

---

## Smart Contract Functions

| Function | Auth | Description |
|---|---|---|
| `init()` | — | Initialize storage |
| `record_fee(network, base_fee, sequence)` | — | Store gas fee snapshot |
| `get_fees(network, limit)` | — | Get recent fees |
| `record_tx(user, amount, tx_type, network, timestamp)` | ✅ | Record user transaction |
| `get_spending(user, from_ts, to_ts)` | — | Total spending in range |
| `get_txs(user, limit)` | — | Recent transactions |
| `set_price(token, price)` | — | Oracle price feed |
| `get_price(token)` | — | Get token price |
| `deploy_cost(code_size, network)` | — | Estimate deployment cost |

---

## Deployment Cost Formula

```
testnet: total = 100_000_000 + (bytes × 200) stroops
mainnet: total = 500_000_000 + (bytes × 1_000) stroops
1 XLM = 10,000,000 stroops
```

---

## Tech Stack

- **Blockchain:** Stellar Soroban (soroban-sdk v25)
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **SDKs:** @stellar/stellar-sdk v16, @stellar/freighter-api v6
- **Data:** Stellar RPC (live fees) + CoinGecko API (XLM price)
- **Deploy:** Render (static) or Docker (any host)

---

## License

MIT
