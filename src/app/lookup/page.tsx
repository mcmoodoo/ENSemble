"use client";

import { useState } from "react";
import { usePublicClient } from "wagmi";
import { mainnet } from "viem/chains";
import { Header } from "@/components/Header";
import { getDefiProfile, resolveEnsAddress } from "@/lib/ens";
import type { DefiProfile } from "@/lib/defi-profile-spec";

export default function LookupPage() {
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [name, setName] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<DefiProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    const trimmed = name.trim();
    if (!trimmed || !publicClient) return;
    setLoading(true);
    setError(null);
    setAddress(null);
    setProfile(null);
    try {
      const addr = await resolveEnsAddress(publicClient, trimmed);
      if (!addr) {
        setError("No address found for this ENS name.");
        return;
      }
      setAddress(addr);
      const p = await getDefiProfile(publicClient, trimmed);
      setProfile(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Look up profile
        </h1>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="e.g. vitalik.eth"
            className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={loading || !name.trim()}
            className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Look up"}
          </button>
        </div>
        {error && (
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}
        {address && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              <strong>Address</strong>: {address}
            </p>
            {profile && (
              <>
                <p className="text-sm">
                  <strong>Slippage (bps)</strong>: {profile.slippageBps ?? "—"}
                </p>
                <p className="text-sm">
                  <strong>Preferred DEXes</strong>:{" "}
                  {profile.preferredDexes?.length
                    ? profile.preferredDexes.join(", ")
                    : "—"}
                </p>
                <p className="text-sm">
                  <strong>Default chain ID</strong>:{" "}
                  {profile.defaultChainId ?? "—"}
                </p>
                <p className="text-sm">
                  <strong>Allowed tokens</strong>:{" "}
                  {profile.allowedTokens?.length
                    ? profile.allowedTokens.join(", ")
                    : "—"}
                </p>
                <p className="text-sm">
                  <strong>Payment: preferred token</strong>:{" "}
                  {profile.paymentPreferredToken ?? "—"}
                </p>
                <p className="text-sm">
                  <strong>Payment: preferred chain ID</strong>:{" "}
                  {profile.paymentPreferredChainId ?? "—"}
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
