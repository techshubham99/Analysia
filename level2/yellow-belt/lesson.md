# Lessons Learned

## Freighter API (soroban-client v25 era)

### Critical: How Freighter Injects Into Window

- Freighter sets **`window.freighter`** as a **boolean** (NOT `window.stellar.freighter`)
- DO NOT check `window.stellar?.freighter?.isConnected` — that's wrong
- The correct detection: `typeof window !== "undefined" && typeof (window as any).freighter !== "undefined"`
- `isConnected()` from `@stellar/freighter-api` checks `window.freighter` first as a fast path, then falls back to `window.postMessage` with a 2-second timeout

### requestAccess() NEVER throws

- `requestAccess()` returns `{ address: string } & { error?: FreighterApiError }`
- On rejection: returns `{ address: "", error: { code: number, message: string } }` — does NOT throw
- On success: returns `{ address: "G..." }` — no error field
- **WRONG pattern**: try/catch around requestAccess()
- **CORRECT pattern**: check return value — `if (accessRes.address) { ... } else { showError(accessRes.error?.message) }`

### getAddress() NEVER throws

- Same return shape as requestAccess()
- On failure (timeout, not authorized): returns `{ address: "", error?: ... }` — does NOT throw
- On success: returns `{ address: "G..." }`

### isConnected() return type
- Returns `{ isConnected: boolean } & { error?: FreighterApiError }`
- The 2-second timeout means it can return `{ isConnected: false }` if Freighter doesn't respond in time

### FreighterApiError shape
```typescript
interface FreighterApiError {
  code: number;
  message: string;
  ext?: string[];
}
```

## Next.js 16 / React 19 Notes
- `useRef<T>()` without initial value doesn't compile — must pass `useRef<T>(initialValue)`
- `requestAnimationFrame` cleanup: use `useRef<number>(0)` — `cancelAnimationFrame(0)` is harmless

## Stellar Soroban Contract Bindings
- Import via relative path (`../../packages/contract/src/index`) instead of npm package
- This avoids a dist/ prebuild step that fails on Render
- Generated client type: `Contract.contract.AssembledTransaction<T>`
- Never import from `"contract"` package — import from source path directly
