// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // Enable async loading of `.wasm` files
      layers: true, // Enable module layer features
      topLevelAwait: true, // Enable top-level await
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Ensure `fs` is not included in the browser
        crypto: require.resolve("crypto-browserify"), // Polyfill for crypto
        stream: require.resolve("stream-browserify"), // Polyfill for stream
        buffer: require.resolve("buffer/"), // Polyfill for buffer
        util: require.resolve("util/"), // Polyfill for util
        process: require.resolve("process/browser"), // Polyfill for process
      };
    }

    return config;
  },
};
