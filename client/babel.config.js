module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 路径别名支持
      ['module-resolver', {
        alias: {
          '@': './',
        },
      }],
      // react-native-reanimated 必须是最后一个插件
      'react-native-reanimated/plugin',
    ],
  };
};
