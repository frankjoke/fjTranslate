process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
  transpileDependencies: ["vuetify"],

  devServer: {
    overlay: {
      warnings: false,
      errors: true
    }
  },

  runtimeCompiler: true,

  css: {
    extract: false
  },

  assetsDir: "assets",
  productionSourceMap: false,
  publicPath: "",
  pluginOptions: {
    build: {
      appId: "com.translatedictionary.app",
      win: {
        icon: "./public/favicon.ico"
      },
      extraResources: ["files"]
    },
    electronBuilder: {
      appId: "com.translatedictionary.app",
      win: {
        icon: "./public/favicon.ico"
      },
      extraResources: ["files"]
    }
  }
};