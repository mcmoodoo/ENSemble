import type { PublicClient, WalletClient } from "viem";
import { getEnsAddress, getEnsName, getEnsText, getEnsResolver, namehash, normalize } from "viem/ens";
import { mainnet } from "viem/chains";
import {
  type DefiProfile,
  parseDefiProfile,
  defiProfileToRecords,
  DEFI_PROFILE_KEYS,
} from "./defi-profile-spec";

const PUBLIC_RESOLVER_ABI = [
  {
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    name: "setText",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Get Ethereum address for an ENS name (mainnet).
 */
export async function resolveEnsAddress(
  client: PublicClient,
  ensName: string
): Promise<`0x${string}` | null> {
  const normalized = normalize(ensName);
  return getEnsAddress(client, { name: normalized });
}

/**
 * Reverse resolve: get ENS name for an address (mainnet).
 */
export async function resolveEnsName(
  client: PublicClient,
  address: `0x${string}`
): Promise<string | null> {
  return getEnsName(client, { address });
}

/**
 * Read a single text record (mainnet).
 */
export async function getEnsTextRecord(
  client: PublicClient,
  ensName: string,
  key: string
): Promise<string | null> {
  const normalized = normalize(ensName);
  const value = await getEnsText(client, { name: normalized, key });
  return value && value.length > 0 ? value : null;
}

/**
 * Read all DeFi profile text records and return parsed DefiProfile.
 */
export async function getDefiProfile(
  client: PublicClient,
  ensName: string
): Promise<DefiProfile> {
  const normalized = normalize(ensName);
  const records: Record<string, string> = {};

  for (const key of DEFI_PROFILE_KEYS) {
    const value = await getEnsText(client, { name: normalized, key });
    if (value && value.length > 0) records[key] = value;
  }

  return parseDefiProfile(records);
}

/**
 * Write only the given ENS text records (mainnet). Caller must be name owner.
 * Sends one transaction per record (resolver requires msg.sender to be owner, so we cannot batch via Multicall3).
 */
export async function setDefiProfileRecords(
  publicClient: PublicClient,
  walletClient: WalletClient,
  ensName: string,
  records: Record<string, string>
): Promise<{ hash: `0x${string}` }[]> {
  const normalized = normalize(ensName);
  const node = namehash(normalized);
  const entries = Object.entries(records);
  if (entries.length === 0) return [];

  const resolverAddress = await getEnsResolver(publicClient, { name: normalized });
  if (!resolverAddress) throw new Error("No resolver for this ENS name");

  const account = walletClient.account;
  if (!account) throw new Error("Wallet not connected");

  const hashes: { hash: `0x${string}` }[] = [];
  for (const [key, value] of entries) {
    const hash = await walletClient.writeContract({
      address: resolverAddress,
      abi: PUBLIC_RESOLVER_ABI,
      functionName: "setText",
      args: [node, key, value],
      account,
      chain: mainnet,
    });
    hashes.push({ hash });
  }
  return hashes;
}

/**
 * Write DeFi profile to ENS (mainnet). Caller must be name owner.
 * Converts profile to records and calls setDefiProfileRecords.
 */
export async function setDefiProfile(
  publicClient: PublicClient,
  walletClient: WalletClient,
  ensName: string,
  profile: Partial<DefiProfile>
): Promise<{ hash: `0x${string}` }[]> {
  return setDefiProfileRecords(
    publicClient,
    walletClient,
    ensName,
    defiProfileToRecords(profile)
  );
}
