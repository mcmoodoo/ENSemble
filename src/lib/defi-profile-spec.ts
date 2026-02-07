/**
 * DeFi profile spec: ENS text record keys and value formats.
 * See docs/DEFI_PROFILE_SPEC.md (or IMPLEMENTATION_PLAN.md) for full spec.
 */

export const DEFI_PROFILE_KEYS = [
  "defi.version",
  "defi.slippage-bps",
  "defi.preferred-dexes",
  "defi.default-chain",
  "defi.allowed-tokens",
  "payment.preferred-token",
  "payment.preferred-chain",
] as const;

export type DefiProfileKey = (typeof DEFI_PROFILE_KEYS)[number];

export interface DefiProfile {
  version: string | null;
  slippageBps: number | null;
  preferredDexes: string[];
  defaultChainId: number | null;
  allowedTokens: string[];
  paymentPreferredToken: string | null;
  paymentPreferredChainId: number | null;
}

export const DEFAULT_DEFI_PROFILE: DefiProfile = {
  version: "1",
  slippageBps: 50,
  preferredDexes: [],
  defaultChainId: 1,
  allowedTokens: [],
  paymentPreferredToken: null,
  paymentPreferredChainId: null,
};

function parseNumber(s: string | null | undefined): number | null {
  if (s == null || s === "") return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

function parseCommaList(s: string | null | undefined): string[] {
  if (s == null || s === "") return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/**
 * Parse raw text record map (key -> string) into DefiProfile.
 */
export function parseDefiProfile(records: Record<string, string>): DefiProfile {
  return {
    version: records["defi.version"] ?? null,
    slippageBps: parseNumber(records["defi.slippage-bps"]) ?? DEFAULT_DEFI_PROFILE.slippageBps,
    preferredDexes: parseCommaList(records["defi.preferred-dexes"]),
    defaultChainId: parseNumber(records["defi.default-chain"]) ?? DEFAULT_DEFI_PROFILE.defaultChainId,
    allowedTokens: parseCommaList(records["defi.allowed-tokens"]),
    paymentPreferredToken: records["payment.preferred-token"] ?? null,
    paymentPreferredChainId: parseNumber(records["payment.preferred-chain"]) ?? null,
  };
}

/**
 * Convert DefiProfile to record of string values for setText.
 */
export function defiProfileToRecords(p: Partial<DefiProfile>): Record<string, string> {
  const out: Record<string, string> = {};
  if (p.version != null) out["defi.version"] = String(p.version);
  if (p.slippageBps != null) out["defi.slippage-bps"] = String(p.slippageBps);
  if (p.preferredDexes != null && p.preferredDexes.length > 0)
    out["defi.preferred-dexes"] = p.preferredDexes.join(",");
  if (p.defaultChainId != null) out["defi.default-chain"] = String(p.defaultChainId);
  if (p.allowedTokens != null && p.allowedTokens.length > 0)
    out["defi.allowed-tokens"] = p.allowedTokens.join(",");
  if (p.paymentPreferredToken !== undefined)
    out["payment.preferred-token"] = p.paymentPreferredToken != null ? String(p.paymentPreferredToken) : "";
  if (p.paymentPreferredChainId != null)
    out["payment.preferred-chain"] = String(p.paymentPreferredChainId);
  return out;
}
