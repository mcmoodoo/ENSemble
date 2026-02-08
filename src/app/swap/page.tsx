"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { mainnet } from "viem/chains";
import { Header } from "@/components/Header";
import { getDefiProfile, resolveEnsName } from "@/lib/ens";
import type { DefiProfile } from "@/lib/defi-profile-spec";
import {
  SWAP_CHAINS,
  SWAP_TOKENS,
  build1inchSwapUrl,
} from "@/lib/swap-constants";

function has1inchPreferred(profile: DefiProfile | null): boolean {
  if (!profile?.preferredDexes?.length) return false;
  return profile.preferredDexes.some(
    (d) => d.trim().toLowerCase() === "1inch"
  );
}

export default function SwapPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [profile, setProfile] = useState<DefiProfile | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [srcChainId, setSrcChainId] = useState<number>(SWAP_CHAINS[0].id);
  const [srcToken, setSrcToken] = useState<string>(SWAP_TOKENS[0].symbol);
  const [dstChainId, setDstChainId] = useState<number>(SWAP_CHAINS[0].id);
  const [dstToken, setDstToken] = useState<string>(SWAP_TOKENS[1].symbol);

  useEffect(() => {
    if (!address || !publicClient) {
      setProfileLoaded(true);
      return;
    }
    let cancelled = false;
    setProfileLoaded(false);
    (async () => {
      try {
        const name = await resolveEnsName(publicClient, address);
        if (cancelled) return;
        setEnsName(name ?? null);
        if (name) {
          const p = await getDefiProfile(publicClient, name);
          if (!cancelled) {
            setProfile(p);
            if (p.defaultChainId != null) {
              const chain = SWAP_CHAINS.find((c) => c.id === p.defaultChainId);
              if (chain) {
                setSrcChainId(chain.id);
                setDstChainId(chain.id);
              }
            }
          }
        } else {
          setProfile(null);
        }
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  const use1inch = has1inchPreferred(profile);
  const swapUrl = build1inchSwapUrl(srcChainId, srcToken, dstChainId, dstToken);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Swap
        </h1>
        {!address && (
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to use your ENSemble profile for swap
            preferences.
          </p>
        )}
        {address && !profileLoaded && (
          <p className="text-gray-600 dark:text-gray-400">
            Loading your profile…
          </p>
        )}
        {address && profileLoaded && (
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
            {use1inch ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Chain
                      </label>
                      <select
                        value={srcChainId}
                        onChange={(e) =>
                          setSrcChainId(Number(e.target.value))
                        }
                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white text-sm"
                      >
                        {SWAP_CHAINS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Token
                      </label>
                      <select
                        value={srcToken}
                        onChange={(e) => setSrcToken(e.target.value)}
                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white text-sm"
                      >
                        {SWAP_TOKENS.map((t) => (
                          <option key={t.symbol} value={t.symbol}>
                            {t.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Destination
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Chain
                      </label>
                      <select
                        value={dstChainId}
                        onChange={(e) =>
                          setDstChainId(Number(e.target.value))
                        }
                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white text-sm"
                      >
                        {SWAP_CHAINS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Token
                      </label>
                      <select
                        value={dstToken}
                        onChange={(e) => setDstToken(e.target.value)}
                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white text-sm"
                      >
                        {SWAP_TOKENS.map((t) => (
                          <option key={t.symbol} value={t.symbol}>
                            {t.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <a
                  href={swapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:opacity-90"
                >
                  Swap on 1inch →
                </a>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                DEX is not available. Set <strong>defi.preferred-dexes</strong>{" "}
                in your ENSemble profile to use the
                swap.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
