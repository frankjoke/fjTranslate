/*
filter attributes into this_attrs and next_attrs
if there is a value named 'my_attrs' use it to filer 
 */

// @vue/component
import Vue from "vue";
import { translate, toadd, dictionary, mylang } from "./dictionary";

import inspect from "browser-util-inspect";

function mapFilters(filters) {
  return filters.reduce((result, filter) => {
    result[filter] = function(...args) {
      return this.$options.filters[filter](...args);
    };
    return result;
  }, {});
}

const helper = {
  computed: {
    myLang() {
      return mylang.split("-")[0];
    }
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
  },
  methods: {
    ...mapFilters(["tt", "ago"]),

    clipboardData() {
      return window;
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

    toAddDictionary() {
      return toadd;
    },

    langDictionary() {
      return dictionary;
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

    pAll(arr, promise, wait) {
      wait = wait || 0;
      if (!Array.isArray(arr) && typeof arr === "object")
        arr = Object.entries(arr);
      const myPromise = key => this.wait(wait).then(_ => promise(key));
      return Promise.all(arr.map(i => myPromise(i)));
    },

    pSequence(arr, promise, wait) {
      wait = wait || 0;
      if (!Array.isArray(arr) && typeof arr === "object")
        arr = Object.entries(arr);
      const res = [];
      const myPromise = key =>
        this.wait(wait).then(_ => promise(key).then(r => res[res.push(r) - 1]));
      return arr
        .reduce((p, x) => p.then(_ => myPromise(x)), Promise.resolve())
        .then(_ => res);
    },

    consoleLog(...args) {
      console.log("helper:", ...args);
    },

    getFormat(v, f = {}) {
      if (typeof f == "string")
        f = {
          value: f
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
          ? i.select.split(",").map(x => x.trim())
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

    wait(time) {
      var timer;
      const that = this;
      return new Promise(res => {
        if (!time || time < 0 || typeof time !== "number")
          return that.$nextTick(res);
        timer = setTimeout(_ => {
          timer = null;
          return res();
        }, time);
      });
    },
    /*     mapSetObject(obj) {
      const nobj = Object.assign({}, obj);
      for (var k of Object.keys(nobj)) {
        const val = nobj[k];
        if (nobj.hasOwnProperty(k))
          this.$set(obj, k, val);
      }
    },
 */
    doCopyClipboard(text) {
      const that = this;
      if (!text) return Promise.resolve();
      if (typeof text !== "string") text = JSON.stringify(text, null, 2);
      return this.$copyText(text).then(
        e => {
          that.$alert("2|success:Copied to clipboard!");
          console.log(e);
        },
        e => {
          that.$alert("warning:Cannot copy!");
          console.log(e);
        }
      );
    }
  }
};

export default helper;
