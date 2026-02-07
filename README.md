# ENS DeFi Profile — Web App

Next.js app: connect wallet, edit your ENS DeFi profile (text records), use it in Swap, send to ENS name, and look up any profile.

## Purpose

Store **swap and payment preferences on your ENS name** so any app that supports this spec can read them. One profile, many apps — set preferences once and use them across DeFi and payment flows.

## Features

| Area | What it does |
|------|---------------|
| **Profile** | Edit and save your DeFi profile to your ENS name (mainnet). Load from ENS, change slippage, DEXes, chain, tokens, payment prefs; save via on-chain transactions. |
| **Swap** | Shows your profile for context; actual swap (0x/1inch) not wired yet — profile would pre-fill slippage, chain, and DEX options. |
| **Send** | Send ETH to an ENS name. Resolves name to address and shows optional payment hints (preferred token/chain) from the recipient’s profile. |
| **Lookup** | Read any ENS name’s address and full DeFi profile (read-only). |

Profile data lives in **ENS text records** (see [DeFi profile keys](#defi-profile-keys) below).

## Stack

- **Next.js 14**, **React 18**, **TypeScript**
- **Tailwind CSS**
- **wagmi 2** + **viem 2** + **RainbowKit 2**
- **React Hook Form** + **Zod**
- ENS via **viem** (no ethers.js)

## Setup

```bash
bun install
```

Create `.env.local` (see `.env.example`):

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

- **WalletConnect**: get a project ID at [WalletConnect Cloud](https://cloud.walletconnect.com/).
- **Mainnet RPC**: set `NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC` for ENS and profile reads in the browser (must be `NEXT_PUBLIC_` so the client can use it).

## Run

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `bun run dev` — dev server
- `bun run build` — production build
- `bun run start` — run production build
- `bun run lint` — ESLint
- `bun run print-ens-records` — print ENS text records (script)

## Pages

- **/** — Landing + links
- **/profile** — My DeFi profile (load from ENS, edit, save via tx)
- **/swap** — Swap (reads profile for pre-fill; 0x/1inch not wired yet)
- **/send** — Send ETH to an ENS name (resolve + optional payment hints)
- **/lookup** — Look up any ENS name’s DeFi profile (read-only)

## DeFi profile keys

See `src/lib/defi-profile-spec.ts` for keys, types, and parsing.
