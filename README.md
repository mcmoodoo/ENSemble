# ENS DeFi Profile — Web App

Next.js app: connect wallet, edit your ENS DeFi profile (text records), use it in Swap, send to ENS name, and look up any profile.

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
INFURA_ETHEREUM_MAINNET_RPC=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

- **WalletConnect**: get a project ID at [WalletConnect Cloud](https://cloud.walletconnect.com/).
- **Mainnet RPC**: set `INFURA_ETHEREUM_MAINNET_RPC` for ENS and profile reads.

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

## Pages

- **/** — Landing + links
- **/profile** — My DeFi profile (load from ENS, edit, save via tx)
- **/swap** — Swap (reads profile for pre-fill; 0x/1inch not wired yet)
- **/send** — Send ETH to an ENS name (resolve + optional payment hints)
- **/lookup** — Look up any ENS name’s DeFi profile (read-only)

## DeFi profile keys

See `src/lib/defi-profile-spec.ts` and `../docs/IMPLEMENTATION_PLAN.md`.
