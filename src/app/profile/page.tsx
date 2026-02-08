"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { mainnet } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";
import { Header } from "@/components/Header";
import { getDefiProfile, resolveEnsName, setDefiProfileRecords } from "@/lib/ens";
import { defiProfileToRecords, type DefiProfile } from "@/lib/defi-profile-spec";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// HTML inputs return strings; number inputs can be "" when empty.
const schema = z.object({
  slippageBps: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => {
      const n = v === "" || v === undefined ? 50 : Number(v);
      return Number.isNaN(n) ? 50 : Math.max(1, Math.min(10000, n));
    }),
  preferredDexes: z.string().optional(),
  defaultChainId: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    }),
  allowedTokens: z.string().optional(),
  paymentPreferredToken: z.string().optional(),
  paymentPreferredChainId: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    }),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const { data: walletClient } = useWalletClient();
  const switchChain = useSwitchChain();

  const [ensName, setEnsName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingRecords, setPendingRecords] = useState<Record<string, string> | null>(null);
  const sendingRef = useRef(false);
  const loadedProfileRef = useRef<DefiProfile | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as import("react-hook-form").Resolver<FormData>,
    defaultValues: {
      slippageBps: 50,
      preferredDexes: "",
      defaultChainId: 1,
      allowedTokens: "",
      paymentPreferredToken: "",
      paymentPreferredChainId: undefined,
    },
  });

  // Resolve address → ENS name and load profile
  useEffect(() => {
    if (!address || !publicClient) return;
    let cancelled = false;
    setLoadError(null);
    (async () => {
      try {
        const name = await resolveEnsName(publicClient, address);
        if (cancelled) return;
        setEnsName(name ?? null);
        if (!name) return;
        const p = await getDefiProfile(publicClient, name);
        if (cancelled) return;
        loadedProfileRef.current = p;
        reset({
          slippageBps: p.slippageBps ?? 50,
          preferredDexes: p.preferredDexes?.join(", ") ?? "",
          defaultChainId: p.defaultChainId ?? 1,
          allowedTokens: p.allowedTokens?.join(", ") ?? "",
          paymentPreferredToken: p.paymentPreferredToken ?? "",
          paymentPreferredChainId: p.paymentPreferredChainId ?? undefined,
        });
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient, reset, refreshCount]);

  function buildPayload(data: FormData): Partial<DefiProfile> {
    return {
      version: "1",
      slippageBps: data.slippageBps != null ? Number(data.slippageBps) : undefined,
      preferredDexes: data.preferredDexes
        ? data.preferredDexes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      defaultChainId: data.defaultChainId != null ? Number(data.defaultChainId) : undefined,
      allowedTokens: data.allowedTokens
        ? data.allowedTokens.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      paymentPreferredToken: data.paymentPreferredToken ?? "",
      paymentPreferredChainId:
        data.paymentPreferredChainId != null
          ? Number(data.paymentPreferredChainId)
          : undefined,
    };
  }

  const onSubmit = (data: FormData) => {
    const payload = buildPayload(data);
    const newRecords = defiProfileToRecords(payload);
    const oldRecords = defiProfileToRecords(loadedProfileRef.current ?? {});
    const changedRecords: Record<string, string> = {};
    for (const [key, value] of Object.entries(newRecords)) {
      const oldVal = oldRecords[key] ?? "";
      if (value !== oldVal) changedRecords[key] = value;
    }
    if (Object.keys(changedRecords).length === 0) {
      setSaveError("No changes to save");
      return;
    }
    setSaveError(null);
    setPendingRecords(changedRecords);
    setShowPreview(true);
  };

  const confirmAndSend = async () => {
    if (!ensName || !publicClient || !walletClient || !pendingRecords) return;
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const chainId = walletClient.chain?.id;
      if (chainId !== mainnet.id) {
        await switchChain.switchChainAsync({ chainId: mainnet.id });
      }
      const hashes = await setDefiProfileRecords(
        publicClient,
        walletClient,
        ensName,
        pendingRecords
      );
      if (hashes.length > 0) {
        await waitForTransactionReceipt(publicClient, { hash: hashes[hashes.length - 1].hash });
      }
      setSaveSuccess(true);
      setShowPreview(false);
      setPendingRecords(null);
      setRefreshCount((c) => c + 1);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
      sendingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          My ENSemble profile
        </h1>

        {!address && (
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to view and edit your ENSemble profile.
          </p>
        )}

        {address && !ensName && !loadError && (
          <p className="text-gray-600 dark:text-gray-400">
            Resolving your ENS name…
          </p>
        )}

        {address && ensName === null && !loadError && (
          <p className="text-gray-600 dark:text-gray-400">
            No ENS name found for this address. Register one at{" "}
            <a
              href="https://app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              app.ens.domains
            </a>{" "}
            and try again.
          </p>
        )}

        {loadError && (
          <p className="text-red-600 dark:text-red-400 mb-4">{loadError}</p>
        )}

        {address && ensName && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Editing profile for <strong>{ensName}</strong>
              {" · "}
              <button
                type="button"
                onClick={() => setRefreshCount((c) => c + 1)}
                className="text-gray-600 dark:text-gray-400 underline hover:no-underline"
              >
                Refresh
              </button>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slippage (basis points)
                </label>
                <input
                  type="number"
                  {...register("slippageBps")}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred DEXes (comma-separated)
                </label>
                <input
                  type="text"
                  {...register("preferredDexes")}
                  placeholder="e.g. uniswap, 1inch"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default chain ID
                </label>
                <input
                  type="number"
                  {...register("defaultChainId")}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allowed tokens (comma-separated)
                </label>
                <input
                  type="text"
                  {...register("allowedTokens")}
                  placeholder="e.g. ETH, USDC, DAI"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment: preferred token
                </label>
                <input
                  type="text"
                  {...register("paymentPreferredToken")}
                  placeholder="e.g. USDC"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment: preferred chain ID
                </label>
                <input
                  type="number"
                  {...register("paymentPreferredChainId")}
                  placeholder="e.g. 8453 for Base"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              {showPreview && pendingRecords && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-3">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    {Object.keys(pendingRecords).length} changed record(s) — you will sign one
                    transaction per record:
                  </p>
                  <pre className="text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 overflow-x-auto">
                    {Object.entries(pendingRecords)
                      .map(([k, v]) => `${k}\n  → ${v === "" ? "(empty)" : v}`)
                      .join("\n\n")}
                  </pre>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={confirmAndSend}
                      disabled={saving}
                      className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? "Sending…" : "Confirm and send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPreview(false);
                        setPendingRecords(null);
                      }}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {Object.keys(errors).length > 0 && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {Object.entries(errors).map(([, v]) => v?.message).filter(Boolean).join(" ")}
                </p>
              )}
              {saveError && (
                <p className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Profile saved to ENS.
                </p>
              )}
              {!showPreview && (
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save to ENS"}
                </button>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
}
