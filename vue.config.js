process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
  transpileDependencies: ["vuetify"],

  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
  },

  runtimeCompiler: true,

  css: {
    extract: false,
  },

  assetsDir: "assets",
  productionSourceMap: false,
  publicPath: "",
  pluginOptions: {
    build: {
      appId: "com.fjTranslate.app",
      win: {
        icon: "./public/favicon.ico",
      },
      extraResources: ["files"],
    },
    electronBuilder: {
      appId: "com.fjTranslate.app",
      win: {
        icon: "./public/favicon.ico",
      },
      extraResources: ["files"],
    },
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true,
    },
  },
};
