const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "worker",
  fallbacks: {
    document: "/offline",
  },
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
  ],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  experimental: {
    scrollRestoration: false,
  },
});