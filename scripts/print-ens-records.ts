/**
 * Print all ENS text records for a given name.
 * Usage: bun run scripts/print-ens-records.ts [ensname]
 * Example: bun run scripts/print-ens-records.ts vitalik.eth
 *
 * Uses INFURA_ETHEREUM_MAINNET_RPC or NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC from env, else https://eth.llamarpc.com. If you hit 429, unset those or use another RPC.
 */

import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { getEnsAddress, getEnsText, normalize } from "viem/ens";

const RPC =
  process.env.NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC ??
  process.env.INFURA_ETHEREUM_MAINNET_RPC ??
  "https://eth.llamarpc.com";

const DEFI_KEYS = [
  "defi.version",
  "defi.slippage-bps",
  "defi.preferred-dexes",
  "defi.default-chain",
  "defi.allowed-tokens",
  "payment.preferred-token",
  "payment.preferred-chain",
] as const;

const COMMON_KEYS = [
  "email",
  "url",
  "avatar",
  "description",
  "com.twitter",
  "com.github",
  "com.discord",
] as const;

const ALL_KEYS = [...DEFI_KEYS, ...COMMON_KEYS];

async function main() {
  const name = process.argv[2] ?? "vitalik.eth";
  const normalized = normalize(name);

  const client = createPublicClient({
    chain: mainnet,
    transport: http(RPC),
  });

  console.log(`ENS name: ${name}\n`);

  const address = await getEnsAddress(client, { name: normalized });
  console.log("Address:", address ?? "(none)");
  console.log("");

  console.log("Text records:");
  for (const key of ALL_KEYS) {
    const value = await getEnsText(client, { name: normalized, key });
    const out = value && value.length > 0 ? value : "(not set)";
    console.log(`  ${key}: ${out}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
