import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Your ENS name, your DeFi preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
          Store swap and payment preferences on your ENS name. Any app that
          supports this spec can read them — one profile, many apps.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/profile"
            className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:opacity-90"
          >
            My profile
          </Link>
          <Link
            href="/swap"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Swap
          </Link>
          <Link
            href="/send"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Send to ENS
          </Link>
          <Link
            href="/lookup"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Look up profile
          </Link>
        </div>
      </main>
    </div>
  );
}
