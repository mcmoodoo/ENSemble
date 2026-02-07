"use client";

import { useState } from "react";
import { usePublicClient, useWalletClient, useSendTransaction } from "wagmi";
import { mainnet } from "viem/chains";
import { parseEther } from "viem";
import { Header } from "@/components/Header";
import {
  resolveEnsAddress,
  getEnsTextRecord,
} from "@/lib/ens";

export default function SendPage() {
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const { data: walletClient } = useWalletClient();
  const { sendTransactionAsync, isPending } = useSendTransaction();

  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [paymentHint, setPaymentHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const resolveRecipient = async () => {
    const trimmed = recipientName.trim();
    if (!trimmed || !publicClient) return;
    setError(null);
    setResolvedAddress(null);
    setPaymentHint(null);
    try {
      const addr = await resolveEnsAddress(publicClient, trimmed);
      if (!addr) {
        setError("No address found for this ENS name.");
        return;
      }
      setResolvedAddress(addr);
      const preferredToken = await getEnsTextRecord(
        publicClient,
        trimmed,
        "payment.preferred-token"
      );
      const preferredChain = await getEnsTextRecord(
        publicClient,
        trimmed,
        "payment.preferred-chain"
      );
      if (preferredToken || preferredChain) {
        setPaymentHint(
          [preferredToken && `Prefers ${preferredToken}`, preferredChain && `Chain ID ${preferredChain}`]
            .filter(Boolean)
            .join(" • ")
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resolve failed");
    }
  };

  const handleSend = async () => {
    if (!resolvedAddress || !amount || !walletClient?.account) return;
    setError(null);
    setTxHash(null);
    try {
      const value = parseEther(amount);
      const hash = await sendTransactionAsync({
        to: resolvedAddress as `0x${string}`,
        value,
        chainId: mainnet.id,
      });
      setTxHash(hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Send to ENS name
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient (ENS name)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. alice.eth"
                className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={resolveRecipient}
                disabled={!recipientName.trim()}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Resolve
              </button>
            </div>
          </div>
          {resolvedAddress && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resolved to: <code className="break-all">{resolvedAddress}</code>
              </p>
              {paymentHint && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {paymentHint}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (ETH)
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.01"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || !amount || !walletClient?.account}
                className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Sending…" : "Send ETH"}
              </button>
            </>
          )}
        </div>
        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}
        {txHash && (
          <p className="mt-4 text-green-600 dark:text-green-400 text-sm">
            Sent. Tx: {txHash}
          </p>
        )}
      </main>
    </div>
  );
}
