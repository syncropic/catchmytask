// // next.config.js
// module.exports = {
//   webpack: (config, { isServer }) => {
//     config.experiments = {
//       ...config.experiments,
//       asyncWebAssembly: true, // Enable async loading of `.wasm` files
//       layers: true, // Enable module layer features
//       topLevelAwait: true, // Enable top-level await
//     };

//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false, // Ensure `fs` is not included in the browser
//         crypto: require.resolve("crypto-browserify"), // Polyfill for crypto
//         stream: require.resolve("stream-browserify"), // Polyfill for stream
//         buffer: require.resolve("buffer/"), // Polyfill for buffer
//         util: require.resolve("util/"), // Polyfill for util
//         process: require.resolve("process/browser"), // Polyfill for process
//       };
//     }

//     return config;
//   },
// };

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   transpilePackages: ["react-force-graph", "three"],
//   webpack: (config, { isServer }) => {
//     config.experiments = {
//       ...config.experiments,
//       asyncWebAssembly: true, // Enable async loading of `.wasm` files
//       layers: true, // Enable module layer features
//       topLevelAwait: true, // Enable top-level await
//     };

//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false, // Ensure `fs` is not included in the browser
//         crypto: require.resolve("crypto-browserify"), // Polyfill for crypto
//         stream: require.resolve("stream-browserify"), // Polyfill for stream
//         buffer: require.resolve("buffer/"), // Polyfill for buffer
//         util: require.resolve("util/"), // Polyfill for util
//         process: require.resolve("process/browser"), // Polyfill for process
//       };
//     }

//     return config;
//   },
// };

// module.exports = nextConfig;

// const webpack = require("webpack");

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   transpilePackages: ["react-force-graph", "three"],
//   webpack: (config, { isServer }) => {
//     config.experiments = {
//       ...config.experiments,
//       asyncWebAssembly: true,
//       layers: true,
//       topLevelAwait: true,
//     };

//     // Add null loader for aframe
//     config.module.rules.push({
//       test: /aframe/,
//       use: "null-loader",
//     });

//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         crypto: require.resolve("crypto-browserify"),
//         stream: require.resolve("stream-browserify"),
//         buffer: require.resolve("buffer/"),
//         util: require.resolve("util/"),
//         process: require.resolve("process/browser"),
//       };
//     }

//     return config;
//   },
// };

// module.exports = nextConfig;

// const webpack = require("webpack");

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   transpilePackages: ["react-force-graph", "three"],
//   webpack: (config, { isServer }) => {
//     config.experiments = {
//       ...config.experiments,
//       asyncWebAssembly: true,
//       layers: true,
//       topLevelAwait: true,
//     };

//     // More specific handling for aframe
//     config.module.rules.push({
//       test: /node_modules\/aframe\/.*\.js$/,
//       loader: "null-loader",
//     });

//     // Add environment definitions
//     config.plugins.push(
//       new webpack.DefinePlugin({
//         "global.self": JSON.stringify({}),
//       })
//     );

//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         crypto: require.resolve("crypto-browserify"),
//         stream: require.resolve("stream-browserify"),
//         buffer: require.resolve("buffer/"),
//         util: require.resolve("util/"),
//         process: require.resolve("process/browser"),
//       };

//       // Add browser-specific aliases
//       config.resolve.alias = {
//         ...config.resolve.alias,
//         aframe: false,
//       };
//     }

//     return config;
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-force-graph-2d", "d3"],
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };

    // Remove the aframe null loader since we're not using it anymore
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        util: require.resolve("util/"),
        process: require.resolve("process/browser"),
      };
    }

    return config;
  },
};

module.exports = nextConfig;
