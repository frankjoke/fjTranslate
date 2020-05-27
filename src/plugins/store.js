import Vue from "vue";
import Vuex from "vuex";

const mylang = (navigator.language || navigator.userLanguage).slice(0, 2);
const version = process.env.VUE_APP_VERSION;
const envConfig = process.env.FJTRANSLATE_CONFIG;
//const yandexEnv = process.env.FJTRANSLATE_YANDEXKEY;

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {
      devLocale: "en",
      configFile: "./config.json",
      autosave: true,
      env: null,
      allLocales: [
        "en",
        "de",
        "ru",
        "pt",
        "nl",
        "fr",
        "it",
        "es",
        "pl",
        "zh-cn",
      ],
      locales: ["de", "ru", "pt", "nl", "fr", "it", "es", "pl", "zh-cn"],
      useYandex: false,
      globalWordsFile: {
        addAtEnd: "!",
        addAtStart: "!",
        skipAfterEnd: "}",
        skipAtStart: "{",
        type: "JSON",
        autosave: true,
        autoload: true,
        name: "",
      },
      editWordsFile: {
        addAtEnd: "!",
        addAtStart: "!",
        skipAfterEnd: "}",
        skipAtStart: "{",
        type: "Javascript",
        autosave: true,
        autoload: true,
        name: "",
      },
      yandexKey: "",
    },
    globalContent: {},
    globalCompare: "",
    editContent: {},
    editCompare: "",
    version,
    envConfig,
    myLang: mylang,
    update: true,
    editExpand: {},
    saveTimer: 0,
    globalOnly: false,
    noGlobal: false,
    editDialog: {
      dialog: false,
      wasGoogleError: false,
      lang: "",
      olang: "",
      translation: "",
      otranslation: "",
      createNew: false,
      showTrans: false,
    },
    lastGoogleErr: 0,
    yandex: {
      // yandex: null,
      // yandexLangs: [],
      yandexKey: "",
    },
  },
  getters: {
    devLocale: (state, getters) => getters.config.devLocale,
    yandexKey: (state, getters) =>
      getters.yandex.yandexKey || getters.config.yandexKey,
    config: (state) => state.config,
    version: (state) => state.version,
    envConfig: (state) => state.envConfig,
    editContent: (state) => state.editContent,
    globalContent: (state) => state.globalContent,
    myLang: (state) => state.myLang,
    yandex: (state) => state.yandex,
  },
  mutations: {},
  actions: {},
  modules: {},
});
