const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  fallbacks: {
    document: "/offline",
  },

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
});