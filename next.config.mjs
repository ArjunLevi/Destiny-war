import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { webpack, isServer }) => {
    // WalletConnect / MetaMask optional deps — not used in the browser bundle
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino-pretty|lokijs|encoding)$/,
      }),
    );
    return config;
  },
};

export default nextConfig;
