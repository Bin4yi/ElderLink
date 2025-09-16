module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          files: ['*.ttf'],
        },
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          fontDir: './app/src/main/assets/fonts',
        },
      },
    },
  },
};