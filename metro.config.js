const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// See https://github.com/expo/expo/discussions/36551
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
