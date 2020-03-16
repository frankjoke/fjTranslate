import config from "@/assets/config";
import words from "@/assets/words";
import Vue from "vue";
import Vuex from "vuex";
import { saveAs } from "file-saver";

import { setCORS } from "google-translate-api-browser";
// setting up cors-anywhere server address
const gTranslate = setCORS("http://cors-anywhere.herokuapp.com/");

import YandexTranslator from "yandex-translator";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: config,
    words: words,
    globalWords: null,
    editWords: null,
    yandex: null,
    yandexLangs: [],
    lang: (navigator.language || navigator.userLanguage).substring(0, 2)
  },
  mutations: {
    changeConfig(state, conf) {
      state.config = conf;
    },
    updateYandex(state) {
      state.yandex = new YandexTranslator(state.config.yandexKey);
      console.log("updateYandex", state.yandex);
    },
    updateYandexLangs(state, langs) {
      state.yandexLangs = langs;
      console.log("updateYandexLangs", state.yandexLangs);
    },
    updateEditWords(state, langs) {
      state.editWords = langs;
    },
    updateGlobalWords(state, langs) {
      state.globalWords = langs;
    }
  },
  actions: {
    saveConfig({ state, commit }, conf) {
      commit("changeConfig", conf);
      console.log("changeConfig", conf);
      return conf;
    },
    googleTranslate({ state, commit }, opts_) {
      const opts = {
        from: opts_.from || "auto",
        to: opts_.to || "en",
        hl: opts_.hl || "en",
        raw: opts_.raw || false,
        tld: opts_.tld || "com"
      };
      const text = opts_.text || "no text supplied";
      return gTranslate(text, opts);
    },
    anyTranslate({ state, commit }, opts_) {
      const opts = {
        from: opts_.from || "auto",
        to: opts_.to || "en",
        hl: opts_.hl || "en",
        raw: opts_.raw || false,
        tld: opts_.tld || "com",
        text: opts_.text || "no text supplied"
      };
      if (
        !state.yandex ||
        !state.config.useYandex ||
        state.yandexLangs.indexOf(opts.from) < 0 ||
        state.yandexLangs.indexOf(opts.to) < 0
      )
        return gTranslate(opts.text, opts).then(res => {
          res.service = "yandex";
          return res;
        });
      return state.yandex
        .translate(opts)
        .then(res => JSON.parse(res))
        .then(res => {
          res.service = "yandex";
          if (Array.isArray(res.text)) res.text = res.text.join("\n");
          return res;
        });
    },
    saveYandex({ state, commit }) {
      if (!state.config.useYandex || !state.config.yandexKey)
        return Promise.resolve("Yandex is switched off!");
      if (!state.yandex) commit("updateYandex");
      return state.yandex
        .getAvailableLanguages()
        .then(v => {
          let dist = JSON.parse(v);
          if (dist && dist.dirs)
            dist = dist.dirs.filter(
              i => i.split("-")[0] == state.config.devLocale
            );
          dist = dist.map(i => i.split("-")[1]);
          if (dist.length > 0) dist.push(state.config.devLocale);
          commit("updateYandexLangs", dist);
        })
        .catch(e => console.log("error:", e));
    },
  }
});
