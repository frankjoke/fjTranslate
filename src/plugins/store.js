import Vue from "vue";
import Vuex from "vuex";

const mylang = (navigator.language || navigator.userLanguage).slice(0, 2);
const version = process.env.VUE_APP_VERSION;
const envConfig = process.env.FJTRANSLATE_CONFIG;
//const yandexEnv = process.env.FJTRANSLATE_YANDEXKEY;

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    env: null,
    config: {
      devLocale: "en",
      configFile: "./config.json",
      autosave: true,
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
        autoload: false,
        name: "",
      },
      yandexKey: "",
      googleKey: "",
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
    translateKeys: {
      // yandex: null,
      // yandexLangs: [],
      yandexKey: "",
      googleKey: "",
    },
  },
  getters: {
    devLocale: (state, getters) => getters.config.devLocale,
    yandexKey: (state, getters) =>
      getters.translateKeys.yandexKey || getters.config.yandexKey,
    googleKey: (state, getters) =>
      getters.translateKeys.googleKey || getters.config.googleKey,
    config: (state) => state.config,
    version: (state) => state.version,
    envConfig: (state) => state.envConfig,
    env: (state) => state.env,
    editContent: (state) => state.editContent,
    globalContent: (state) => state.globalContent,
    myLang: (state) => state.myLang,
    translateKeys: (state) => state.translateKeys,
  },
  mutations: {
    config(state, value) {
      state.config = value;
    },
    env(state, value) {
      state.env = value;
    },
    globalContent(state, value) {
      state.globalContent = value;
    },
    globalCompare(state, value) {
      state.globalCompare = value;
    },
    editContent(state, value) {
      state.editContent = value;
    },
    editCompare(state, value) {
      state.editCompare = value;
    },
    update(state, value) {
      state.update = value;
    },
    editExpand(state, value) {
      state.editExpand = value;
    },
    saveTimer(state, value) {
      state.saveTimer = value;
    },
    globalOnly(state, value) {
      state.globalOnly = value;
    },
    noGlobal(state, value) {
      state.noGlobal = value;
    },
    editDialog(state, value) {
      state.editDialog = value;
    },
    lastGoogleErr(state, value) {
      state.lastGoogleErr = value;
    },
    translateKeys(state, value) {
      state.translateKeys = value;
    },
  },
  actions: {},
  modules: {},
});
