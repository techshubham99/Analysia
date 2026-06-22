# 🟡 StellarGas.Calculator — Yellow Belt

> **Advanced level.** Real-time gas fee calculator for Stellar with Soroban contract integration, live pricing, spending analytics, and deployment cost estimation.

## What's New (vs Level 1)

| Feature | Level 1 | Yellow Belt |
|---|---|---|
| Static Export | ❌ | ✅ Render-ready `render.yaml` |
| Docker Deploy | ❌ | ✅ Multi-stage `Dockerfile` |
| Nginx Config | ❌ | ✅ Optimized with gzip + caching |
| Contract Bindings | ❌ | ✅ Auto-generated typed client |
| Render Blueprint | ❌ | ✅ Infrastructure as Code |

## Deployment Options

### Option 1: Render (Free — Static Site)

1. Push this folder to a GitHub repo
2. Go to [dashboard.render.com](https://dashboard.render.com) → New + → Static Site
3. Connect your repo
4. Use these settings:

| Setting | Value |
|---|---|
| **Build Command** | `bun install && bun run build` |
| **Publish Directory** | `out` |
| **Branch** | `main` |

Render will auto-detect the `render.yaml` blueprint if you connect the root repo.

### Option 2: Docker (Any Host)

```bash
docker build -t stellargas-calculator .
docker run -p 80:80 stellargas-calculator
```

Then open http://localhost

### Option 3: Manual Static Hosting

```bash
bun install && bun run build
# out/ directory is ready to deploy to any static host
```

## Quick Start

```bash
bun install
bun run dev         # http://localhost:3000
bun run build       # Produces out/ for static deployment
```

## Contract

Deployed on testnet: `CBVLE4GF7EHU7C2VZOXIPYHLA3QGLSF6ZJXCR5K5OFSAIKEEKRDO5JNG`

```bash
cd contract
cargo test          # 12 tests
stellar contract build
```
