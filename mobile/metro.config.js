// Metro must resolve .wasm assets — expo-sqlite's web worker imports
// wa-sqlite/wa-sqlite.wasm, and .wasm is not a default asset extension.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

module.exports = config;
