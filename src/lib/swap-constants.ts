/**
 * Hardcoded chains and tokens for the swap UI.
 * Used to build 1inch swap URLs: src=chainId:SYMBOL&dst=chainId:SYMBOL
 */

export const SWAP_CHAINS = [
  { id: 1, name: "Ethereum" },
  { id: 10, name: "Optimism" },
  { id: 137, name: "Polygon" },
  { id: 42161, name: "Arbitrum" },
  { id: 8453, name: "Base" },
] as const;

export const SWAP_TOKENS = [
  { symbol: "ETH" },
  { symbol: "WETH" },
  { symbol: "USDC" },
  { symbol: "USDT" },
  { symbol: "DAI" },
  { symbol: "LINK" },
  { symbol: "WBTC" },
  { symbol: "UNI" },
  { symbol: "AAVE" },
] as const;

const ONE_INCH_SWAP_BASE = "https://1inch.com/swap";

/**
 * Build 1inch swap URL.
 * @see https://portal.1inch.dev/documentation/swap/swap-url
 * Format: ?src=chainId:tokenSymbol&dst=chainId:tokenSymbol
 */
export function build1inchSwapUrl(
  srcChainId: number,
  srcToken: string,
  dstChainId: number,
  dstToken: string
): string {
  const params = new URLSearchParams({
    src: `${srcChainId}:${srcToken}`,
    dst: `${dstChainId}:${dstToken}`,
  });
  return `${ONE_INCH_SWAP_BASE}?${params.toString()}`;
}
