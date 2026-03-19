module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',               // NativeWind v2: goes in plugins
      'react-native-reanimated/plugin', // Reanimated plugin MUST be last
    ],
  };
};