/*
filter attributes into this_attrs and next_attrs
if there is a value named 'my_attrs' use it to filer 
 */

// @vue/component
// import Vue from "vue";
import inspect from "browser-util-inspect";
import { mapState } from "vuex";
import axios from "axios";
//import { setCORS } from "google-translate-api-browser";
// setting up cors-anywhere server address
//const gTranslate = setCORS("http://cors-anywhere.herokuapp.com/");

const YandexTranslator = require("yandex-translator");
//import config from "@/assets/config.json";
//import global from "@/assets/global";

const mylang = (navigator.language || navigator.userLanguage).slice(0, 2);
const version = process.env.VUE_APP_VERSION;
//const envConfig = process.env.FJTRANSLATE_CONFIG;

function mapFilters(filters) {
  return filters.reduce((result, filter) => {
    result[filter] = function (...args) {
      return this.$options.filters[filter](...args);
    };
    return result;
  }, {});
}

const helper = {
  // data() {
  //   return {
  //     lastGoogleErr: 0,
  //   };
  // },
  computed: {
    env() {
      return this.$store.state.env;
    },
    yandexKey() {
      return this.$store.getters.yandexKey;
    },
    changedGlobal() {
      return this.globalCompare != JSON.stringify(this.globalContent);
    },
    isGlobalContent() {
      return this.globalContent && this.globalCompare != "{}";
    },
    changedWords() {
      return this.editCompare != JSON.stringify(this.editContent);
    },
    envConfig() {
      return this.$store.state.env.FJTRANSLATE_CONFIG;
    },
    ...mapState(["version", "myLang", "yandex"]),

    devLocale() {
      return this.$store.getters.devLocale;
    },
    wasGoogleError: {
      get() {
        const now = Date.now();
        return now - this.$store.state.lastGoogleErr < 30000;
      },
      set(value) {
        this.$store.state.lastGoogleErr = value ? Date.now() : 0;
      },
    },
    saveTimer: {
      get() {
        return this.$store.state.saveTimer;
      },
      set(value) {
        const that = this;
        if (that.$store.state.saveTimer) {
          clearTimeout(this.$store.state.saveTimer);
          that.$store.state.saveTimer = 0;
        }
        if (value) {
          that.$store.state.saveTimer = setTimeout(() => {
            that.$store.state.saveTimer = 0;
            try {
              that.saveTimeout();
            } finally {
              // console.log("SaveTimeout!");
            }
          }, 5000);
        }
      },
    },
    config: {
      get() {
        return this.$store.state.config;
      },
      set(value) {
        this.$set(this.$store.state, "config", value);
        // this.$store.state.config = value;
      },
    },
    globalContent: {
      get() {
        return this.$store.state.globalContent;
      },
      set(value) {
        this.$set(this.$store.state, "globalContent", value);
        this.$set(this.$store.state, "globalCompare", this.myStringify(value));
        // this.$store.state.globalContent = value;
      },
    },
    globalCompare: {
      get() {
        return this.$store.state.globalCompare;
      },
      set(value) {
        this.$set(
          this.$store.state,
          "globalCompare",
          value === true ? this.myStringify(this.globalContent) : value
        );
      },
    },
    editCompare: {
      get() {
        return this.$store.state.editCompare;
      },
      set(value) {
        this.$set(
          this.$store.state,
          "editCompare",
          value === true ? this.myStringify(this.editContent) : value
        );
      },
    },
    editContent: {
      get() {
        return this.$store.state.editContent;
      },
      set(value) {
        this.$set(this.$store.state, "editContent", value);
        this.$set(this.$store.state, "editCompare", this.myStringify(value));
      },
    },
    editExpand: {
      get() {
        return this.$store.state.editExpand;
      },
      set(value) {
        this.$set(this.$store.state, "editExpand", value);
        // this.$store.state.editExpand = value;
      },
    },
    editDialog: {
      get() {
        return this.$store.state.editDialog;
      },
      set(value) {
        this.$set(this.$store.state, "editDialog", value);
        // this.$store.state.editDialog = value;
      },
    },
    globalOnly: {
      get() {
        return this.$store.state.globalOnly;
      },
      set(value) {
        this.$set(this.$store.state, "globalOnly", value);
        // this.$store.state.globalOnly = value;
      },
    },
    noGlobal: {
      get() {
        return this.$store.state.noGlobal;
      },
      set(value) {
        this.$set(this.$store.state, "noGlobal", value);
        // this.$store.state.globalOnly = value;
      },
    },
  },
  /* 
    safeId() {
      // Computed property that returns a dynamic function for creating the ID.
      // Reacts to changes in both .id and .localId_ And regens a new function
      const id = this.id || this.localId_;

      // We return a function that accepts an optional suffix string
      // So this computed prop looks and works like a method!!!
      // But benefits from Vue's Computed prop caching
      const fn = suffix => {
        if (!id) {
          return null;
        }
        suffix = String(suffix || "").replace(/\s+/g, "_");
        return suffix ? id + "_" + suffix : id;
      };
      return fn;
    }
   */
  watch: {
    async devLocale(newV, oldV) {
      // console.log("devLocale changed:", newV, oldV);
      await this.wait(1).then((_) => this.saveYandex());
      //      if (newV !== this.config.devLocale) this.$set(this.config, "devLocale", newV);
    },
    globalContent() {
      this.saveTimer = true;
    },
    editContent() {
      this.saveTimer = true;
    },
  },
  methods: {
    async loadTextFromFile(path, opts, title) {
      opts = opts || {};
      title = title || opts.title || that.$t("load file");
      const that = this;
      //      console.log(path, that);
      try {
        const file = path
          ? path
          : await that.selectFile(opts.name || opts.fileName || "./*.*", title);

        if (!file) return null;
        opts.name = file;

        let r = await that.$electron.readFile(file, "utf8");

        r = that.importFile(r, opts);
        //        console.log("results text:", r);
        that.$alert &&
          that.$alert(`2|success:${title} ${file} ${that.$t("loaded!")}`);
        //        this.value = r;
        //        return r;
        //       this.$emit("load", e.target.result);        //        if (entry && index) entry[index] = r;
        return r;
      } catch (e) {
        that.$alert(`error:FileLoadError ${e}`);
      }
    },

    async saveFile(what, opts, e) {
      const that = this;

      const { mime, str, name } = that.exportFile(what, opts);
      if (!mime) throw new Error(that.$t("invalid value to save!"));

      //      console.log("Want to save file:", name, opts, e);

      if (e && e.shiftKey) {
        e.preventDefault();
        that.doCopyClipboard(str.toString());
        return null;
      }
      if ((e && e.altKey) || e === true) {
        const ret = await that.$electron.dialog.showSaveDialog({
          defaultPath: name,
          title: that.$t("Save file to:"),
        });
        if (!ret || ret.canceled || !ret.filePath) return null;
        await that.saveFileWindows(ret.filePath, str.toString());
        if (typeof opts === "object") opts.name = ret.filePath;
        return ret.filePath;
      }

      await that.saveFileWindows(name, str.toString());
      return name;
    },

    async saveTimeout() {
      const that = this;
      // console.log("saveTimeout");
      if (that.changedGlobal && that.config.globalWordsFile.autosave) {
        await that.saveFile(that.globalContent, that.config.globalWordsFile);
        this.globalCompare = true;
      }
      if (that.changedWords && that.config.editWordsFile.autosave) {
        await that.saveFile(that.editContent, that.config.editWordsFile);
        that.editCompare = true;
      }
      return null;
    },

    importFile(r, opts) {
      opts = opts || {
        type: "JSON",
      };
      const { skipAtStart, skipAfterEnd, type } = opts;
      let ss = skipAtStart ? r.indexOf(skipAtStart) : -1;
      if (ss > 0) {
        opts.skippedAtStart = r.slice(0, ss);
        r = r.slice(ss);
      }
      let se = skipAfterEnd ? r.lastIndexOf(skipAfterEnd) : -1;
      if (se > 0) {
        opts.skippedAfterEnd = r.slice(se + 1);
        r = r.slice(0, se + 1);
      }
      if (type === "JSON") {
        try {
          r = JSON.parse(r);
        } catch (e) {
          r = "";
          this.$alert(`error:JSON.parse: ${e}`);
        }
      } else if (type === "Javascript") {
        try {
          r = eval("(" + r + ")");
        } catch (e) {
          r = "";
          this.$alert(`error:eval: ${e}`);
        }
      }
      return r;
    },

    translateKey(key, to) {
      return (
        this.globalContent &&
        key &&
        to &&
        this.globalContent[key] &&
        this.globalContent[key][to]
      );
    },

    async translate(key, to) {
      const that = this;
      const tk = that.translateKey(key, to);
      const l = that.devLocale;
      const ec = that.editContent;
      const gc = that.globalContent;
      const gck = gc && gc[key];
      const eck = ec && ec[key];
      const dl = eck[l];
      // console.log("globalFile returned:", key, to, tk, dl);
      if (tk && gck && eck && !that.noGlobal) {
        if (gck[l] === eck[l]) return tk;
      } else if (that.globalOnly) {
        that.$alert({
          type: "error",
          text: that.$t(
            "globalOnly not possible: Global key '{0}' not found for language '{1}'",
            key,
            to
          ),
        });
        return null;
      }

      if (gc) {
        if (!gck && eck[l])
          that.$set(gc, key, {
            [l]: eck[l],
          });
        else if (!gck[l] && eck[l]) that.$set(gck, l, eck[l]);
      }
      const res = await that.anyTranslate({
        text: dl,
        from: that.devLocale || "auto",
        to,
      });
      if (res && res.text) {
        const ret = res.text;
        if (ret && gc) {
          if (!gc[key])
            that.$set(gc, key, {
              [l]: eck[l] || key,
            });
          that.$set(gc[key], to, ret);
        }
        return ret;
      }
      return null;
    },

    async deleteDialogItem(item) {
      const that = this;
      const key = that.editExpand.key;
      const lang = item.lang;
      await that.wait(1);
      //      console.log("removelanguage:", lang, key);
      const res = await that.$fjConfirm(
        `title=Delete language:, color=error darken-2, okColor=error darken-2|Do you really want to delete<br>
      '<strong>${lang}</strong>' from '<strong>${key}</strong>?`
      );
      if (res) that.$delete(that.editContent[key], lang);
    },

    async retranslateAll(item, all, isAll) {
      const that = this;
      const key = (item && item.key) || that.editDialog.key;
      const stat = item ? item : that.editDialog;
      const eck = that.editContent[key];
      const curLangs = Object.keys(eck);
      const toLangs = that.config.allLocales.filter(
        (x) => x !== that.devLocale && (all || curLangs.indexOf(x) < 0)
      );
      if (!isAll) that.$set(stat, "showTrans", true);
      for (const l of toLangs) {
        await that.wait(2);
        const r = await that.translate(key, l);
        if (r) that.$set(eck, l, r);
      }
      that.$set(
        item,
        "notAll",
        Object.keys(eck).length < that.config.allLocales.length
      );
      if (!isAll) that.$set(stat, "showTrans", false);
      await that.wait(2);
      that.saveTimer = true;
      that.$forceUpdate();
      return key;
    },

    async translateAllKeys(all) {
      const that = this;
      that.$set(that.editDialog, "showTrans", true);
      for (const key of that.editKeys) {
        await that.retranslateAll(key, all, true);
        await that.wait(5);
      }
      that.$set(that.editDialog, "showTrans", false);
    },

    async anyTranslate(opts_) {
      const that = this;

      async function gTrans() {
        if (that.wasGoogleError) return null;
        try {
          const res = await translateGoogle(opts.text, opts);
          res.service = "google";
          //            console.log("Google returned ", res, " for ", opts.text);
          return res;
        } catch (e) {
          if (!that.wasGoogleError)
            that.$alert({
              type: "warning",
              tt: "Google translation not available!",
            });
          that.wasGoogleError = true;
          return null;
        }
      }

      async function translateGoogle(text, opts) {
        const cors = "https://cors-anywhere.herokuapp.com/";
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
          opts.from
        }&tl=${opts.to}&dt=t&q=${encodeURIComponent(text)}&ie=UTF-8&oe=UTF-8`;
        let response = null;
        try {
          response = await axios({
            url,
            timeout: 15000,
          }).catch(async (error) => {
            if (error.response && error.response.status == 429)
              that.$alert(
                "warning:" + that.$t("Too many requests for") + " " + url
              );

            return await axios({
              url: cors + url,
              timeout: 15000,
            }).catch((error) => {
              if (error.response && error.response.status == 429)
                that.$alert(
                  "warning:" + that.$t("Too many requests for") + " " + url
                );
              else console.log("Error 2", error.message);
              return null;
            });
          });
          if (response && Array.isArray(response.data)) {
            // we got a valid response
            response.text = response.data[0][0][0];
            response.service = "google";
            return response;
          }
          return null;
          //          throw new Error("Invalid response for translate request");
        } catch (e) {
          throw new Error(`Could not translate to "${targetLang}": ${e}`);
        }
      }

      async function yTrans() {
        async function translateYandex(text, targetLang, yandexKey) {
          if (targetLang === "zh-cn") {
            targetLang = "zh";
          }
          try {
            const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexKey}&text=${encodeURIComponent(
              text
            )}&lang=en-${targetLang}`;
            const response = await axios({
              url,
              timeout: 15000,
            });
            if (response.data && response.data["text"]) {
              return response.data["text"][0];
            }
            throw new Error("Invalid response for translate request");
          } catch (e) {
            // throw new Error(`Could not translate to "${targetLang}": ${e}`);
            return null;
          }
        }

        const mopts = Object.assign({}, opts);
        if (mopts.to == "zh-cn") mopts.to = "zh";
        if (mopts.from == "zh-cn") mopts.from = "zh";
        try {
          // console.log("Translate yandex:", mopts);
          //          let res = await that.yandex.yandex.translate(mopts);
          const res = {
            service: "yandex",
            text: null,
          };
          try {
            res.text = await translateYandex(
              mopts.text,
              mopts.to,
              that.yandexKey
            );
          } finally {
            // console.log(res);
          }
          // res = JSON.parse(res);
          //          if (Array.isArray(res.text)) res.text = res.text.join("\n");
          //            console.log("Yandex returned ", res, " for ", opts.text);
          return res;
        } catch (e) {
          that.$alert({
            type: "warning",
            text: that.$t("Yandex translation error: ${1}", e),
          });
          return null;
        }
      }

      const opts = {
        from: opts_.from || "auto",
        to: opts_.to || "en",
        hl: opts_.hl || "en",
        raw: opts_.raw || false,
        tld: opts_.tld || "com",
        text: opts_.text || "no text supplied",
      };
      const yavailable = that.yandex.yandex;
      // &&
      // that.yandex.yandexLangs.indexOf(opts.from) >= 0 &&
      // that.yandex.yandexLangs.indexOf(opts.to) >= 0;
      if (opts.from === opts.to)
        return that.$alert({
          type: "warning",
          tt: "Cannot translater from/to same language!",
        });

      if (yavailable && (that.config.useYandex || that.wasGoogleError)) {
        const ret = await yTrans().then(
          (r) => (r ? r : gTrans().catch((e) => null)),
          (e) => gTrans().catch((e) => null)
        );
        // console.log(ret);
        return ret;
      }
      const ret = await gTrans().then(
        (r) => (r ? r : yavailable ? yTrans() : null),
        (e) => (yavailable ? yTrans() : null)
      );
      //      console.log(ret);
      return ret;
    },

    async saveYandex() {
      const that = this;
      if (!that.yandexKey) return "Yandex key not available!";
      try {
        if (!that.yandex.yandex)
          that.yandex.yandex = new YandexTranslator(that.yandexKey);
        let dist = await that.yandex.yandex.getAvailableLanguages();
        dist = JSON.parse(dist);
        if (dist && dist.dirs)
          dist = dist.dirs.filter((i) => i.split("-")[0] == that.devLocale);
        dist = dist.map((i) => i.split("-")[1]);
        if (dist.length > 0) dist.push(that.devLocale);
        that.yandexLangs = that.yandex.yandexLangs = dist;
      } catch (e) {
        that.$alert(` SaveYandex error: ${e}`);
      }
    },
    exportFile(what, opts) {
      if (what === undefined || what === null)
        return {
          str: "",
        };
      opts = opts || {
        type: typeof what === "string" ? "Text" : "JSON",
      };
      let {
        type,
        addAtStart,
        addAtEnd,
        saveWithJSON,
        name,
        fileName,
        basename,
        skippedAfterEnd,
        skippedAtStart,
      } = opts;
      const todoTypes = {
        JSON: {
          stringify: true,
          ending: ".json",
          mime: "application/json",
        },
        Javascript: {
          stringify: true,
          ending: ".js",
          mime: "application/javascript",
        },
        Text: {
          ending: ".txt",
          mime: "text/plain",
        },
      };
      let { stringify, ending, mime } = todoTypes[type] || todoTypes.Text;
      stringify = stringify || saveWithJSON;

      name = name
        ? name
        : fileName
        ? fileName
        : (basename ? basename : "file") + ending;
      addAtStart =
        (addAtStart === "!"
          ? skippedAtStart
          : addAtStart && addAtStart.split("\\n").join("\n")) || "";
      addAtEnd =
        (addAtEnd === "!"
          ? skippedAfterEnd
          : addAtEnd && addAtEnd.split("\\n").join("\n")) || "";
      //    debugger;
      const str =
        addAtStart +
        (stringify ? JSON.stringify(what, null, 2) : what) +
        addAtEnd;

      return {
        name,
        str,
        mime,
        ending,
      };
    },

    startCase(str) {
      return str
        .replace(/[_\-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, (str, $1, $2) => $1 + " " + $2)
        .replace(/(\s|^)(\w)/g, (str, $1, $2) => $1 + $2.toUpperCase());
    },

    random(start, end) {
      if (Array.isArray(start))
        return start[Math.floor(Math.random() * start.length)];
      if (typeof end === "number") return Math.random() * (end - start) + start;
      if (typeof start === "number") return Math.random() * start;
      return Math.random();
    },

    inspect(...args) {
      return inspect(...args);
    },

    getType(obj) {
      return Object.prototype.toString
        .call(obj)
        .replace(/^\[object (.+)\]$/, "$1")
        .toLowerCase();
    },
    /*     truncate(what, len, end) {
      return Vue.filter("truncate")(what, len, end);
    },
 */

    consoleLog(...args) {
      console.log("helper:", ...args);
    },

    getFormat(v, f = {}) {
      if (typeof f == "string")
        f = {
          value: f,
        };
      let i = Object.assign({}, f);
      let typ = this.getType(v);
      if (!i.value && i.text) i.value = i.text;
      if (!i.text) i.text = this.startCase(i.value);
      //    if (!i.id) i.id = i.text + "_" + i.value;
      if (!i.type && i.select) i.type = "select";
      if (!i.type)
        switch (typ) {
          case "boolean":
          case "number":
          case "string":
            i.type = typ;
            break;
          case "array":
            i.type = "chips";
            break;
          default:
            i.type = "string";
            break;
        }
      else if (typeof i.type !== "string") i.type = "string";
      if (i.type == "chips" || i.type == "select")
        i.select = Array.isArray(i.select)
          ? i.select
          : typeof i.select == "string"
          ? i.select.split(",").map((x) => x.trim())
          : [];
      if (i.type == "select" && typ == "array") i.multiple = true;
      if (i.type == "textarea" && i.autoGrow) i.rows = 1;
      //    console.log(i);
      return i;
    },
    /* 
    _(text) {
      text = this.tt(text);

      let pos = text.indexOf("%s");
      let count = 0;
      while (pos !== -1 && ++count <= arguments.length) {
        text = text.replace("%s", arguments[count]);
      }
      return text;
    },
 */

    /*     mapSetObject(obj) {
      const nobj = Object.assign({}, obj);
      for (var k of Object.keys(nobj)) {
        const val = nobj[k];
        if (nobj.hasOwnProperty(k))
          this.$set(obj, k, val);
      }
    },
 */
  },

  created() {
    const env = Object.assign(
      {},
      process.env,
      this.$electron.remote.getGlobal("process").env
    );
    console.log(env);
    this.$set(this.$store.state.yandex, "yandexKey", env.FJTRANSLATE_YANDEXKEY);
    this.$set(this.$store.state, "env", env);
  },
};

export default helper;
