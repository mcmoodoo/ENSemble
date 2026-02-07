"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-gray-900 dark:text-white hover:opacity-90"
          >
            ENSemble
          </Link>
          <Link
            href="/profile"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            My profile
          </Link>
          <Link
            href="/swap"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Swap
          </Link>
          <Link
            href="/send"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Send
          </Link>
          <Link
            href="/lookup"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Look up
          </Link>
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
}
