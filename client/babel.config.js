module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated 必须是最后一个插件
      'react-native-reanimated/plugin',
    ],
  };
};
