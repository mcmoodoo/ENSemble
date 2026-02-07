import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, base } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID";

// Next.js only exposes NEXT_PUBLIC_* to the browser. Without this, mainnet uses
// a default RPC (e.g. merkle.io) which can fail. Set in .env.local.
const mainnetRpc =
  process.env.NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC ??
  process.env.INFURA_ETHEREUM_MAINNET_RPC;

export const config = getDefaultConfig({
  appName: "ENS DeFi Profile",
  projectId,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: mainnetRpc ? http(mainnetRpc) : http(),
    [base.id]: http(),
  },
});
