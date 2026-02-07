"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { mainnet } from "viem/chains";
import { Header } from "@/components/Header";
import { getDefiProfile, resolveEnsName } from "@/lib/ens";
import type { DefiProfile } from "@/lib/defi-profile-spec";

export default function SwapPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [profile, setProfile] = useState<DefiProfile | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !publicClient) return;
    let cancelled = false;
    (async () => {
      try {
        const name = await resolveEnsName(publicClient, address);
        if (cancelled) return;
        setEnsName(name ?? null);
        if (name) {
          const p = await getDefiProfile(publicClient, name);
          if (!cancelled) setProfile(p);
        } else {
          setProfile(null);
        }
      } catch {
        if (!cancelled) setProfile(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Swap
        </h1>
        {!address && (
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to use your DeFi profile for swap preferences.
          </p>
        )}
        {address && (
          <>
            {ensName && profile && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                  Using profile from <strong>{ensName}</strong>
                </p>
                <p className="text-sm">
                  Slippage: {profile.slippageBps ?? 50} bps • Default chain:{" "}
                  {profile.defaultChainId ?? 1}
                  {profile.preferredDexes?.length
                    ? ` • DEXes: ${profile.preferredDexes.join(", ")}`
                    : ""}
                </p>
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              Swap UI (0x / 1inch integration) can be wired here. Your profile
              would pre-fill slippage, chain, and DEX options.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
