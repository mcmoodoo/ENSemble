/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC:
      process.env.NEXT_PUBLIC_INFURA_ETHEREUM_MAINNET_RPC ||
      process.env.INFURA_ETHEREUM_MAINNET_RPC,
  },
  webpack: (config) => {
    // Optional deps from WalletConnect / MetaMask SDK; not used in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default nextConfig;
