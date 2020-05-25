import Vue from "vue";
import vuetify from "./plugins/vuetify";

import App from "./App.vue";

import ConfigForm from "./components/ConfigForm";
//import FjB from "./components/FjB";
import FjB from "./components/FjB";
import FjFileLoadButton from "./components/FjFileLoadButton";
import FjTimerRefresh from "./components/FjTimerRefresh";
import FjConfirm from "./components/FjConfirm";
import FjAlerts from "./components/FjAlerts";
import i18n from "./plugins/i18n";
import store from "./plugins/store";
/* 
try {
  const { BrowserWindow } = require("electron");
  const path = require("path");
  const os = require("os");
  BrowserWindow &&
    BrowserWindow.addDevToolsExtension(
      path.join(
        os.homedir(),
        "/Users/sissi/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.3_0"
      )
    );
} catch (e) {
  console.log(e);
}
 */
Vue.config.productionTip = false;
Vue.config.devtools = true; // ==> This line is needed for VueTools <<===
//Vue.config.devtools = __ENV__.NODE_ENV !== 'production';
/* 
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

installExtension(VUEJS_DEVTOOLS)
  .then(name => console.log(`Added Extension:  ${name}`))
  .catch(err => console.log("An Extension error occurred: ", err));
 */
Vue.component("ConfigForm", ConfigForm);
Vue.component("FjB", FjB);
Vue.component("FjAlerts", FjAlerts);
Vue.component("FjTimerRefresh", FjTimerRefresh);
Vue.component("FjFileLoadButton", FjFileLoadButton);
Vue.component("FjConfirm", FjConfirm);
//import { translate, dictionary, toadd } from "./plugins/dictionary";

// console.log(process.env);
let electron = {};
if (process.env.IS_ELECTRON) {
  const { remote, clipboard } = require("electron");
  const { dialog } = remote;
  const fs = require("fs");
  const util = require("util");
  electron = {
    remote,
    clipboard,
    dialog,
    fs,
    util,
    readFile: util.promisify(fs.readFile),
    writeFile: util.promisify(fs.writeFile),
    readDir: util.promisify(fs.readdir),
    realPath: util.promisify(fs.realpath),
  };
  Vue.prototype.$electron = electron;
}

/* Vue.directive("sticky", {
  bind(el, binding, vnode) {
    console.log(binding, vnode);
    if (binding.arg == "bottom") {
      el.style.position = "fixed";
      el.style.bottom = "0px";
      el.style.width = "100%";
    } else {
      el.style.position = "sticky";
      el.style.top = "0px";
    }

    if (binding.modifiers.light) {
      el.style.background = "#CCC";
    }
  },
});
 */
Vue.mixin({
  data() {
    return {
      isElectron: !!process.env.IS_ELECTRON,
      electron,
      showConfigForm: false,
    };
  },
  methods: {
    copyObject(obj) {
      function co(obj, stack) {
        if (Array.isArray(obj))
          return obj.map((i) => {
            stack.push(obj);
            if (stack.indexOf(i) < 0) i = co(i, stack);
            stack.pop();
            return i;
          });
        else if (typeof obj === "object") {
          const no = {};
          stack.push(obj);
          for (const [name, value] of Object.entries(obj)) {
            if (stack.indexOf(value) < 0) no[name] = co(value, stack);
            else console.log("recursive object ", name, value);
          }
          stack.pop();
          return no;
        } else return obj;
      }
      return co(obj, []);
      //      return JSON.parse(this.myStringify(obj));
    },

    myStringify(obj, nice) {
      let res;
      try {
        res = nice ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
      } catch (e) {
        console.log("MyStringify error:", e);
        res = "{}";
      }
      return res;
    },

    makeFunction(rule, that, ...args) {
      that = that || this;

      if (typeof rule == "function") return rule;
      else if (Array.isArray(rule)) {
        rule = rule.map((i) => i.trim());
      } else if (typeof rule == "string" && rule.trim()) {
        if (typeof that[rule] == "function") return that[rule].bind(that);
        rule = [...args, rule.trim()];
        try {
          let b = rule[rule.length - 1];
          b = b.startsWith("return ") || b.startsWith("{") ? b : `return ${b};`;
          rule[rule.length - 1] = b;
          const f = new Function(...rule);
          return f.bind(that);
        } catch (e) {
          console.log(
            `makeFunction error ${e} in function generation with: ${rule}`
          );
        }
      } else
        console.log("makeFunction - Invalid function content in rule:", rule);
      return null;
    },

    wait(time, ...args) {
      var timer;
      const that = this;
      return new Promise((res) => {
        if (!time || time < 0 || typeof time !== "number")
          return that.$nextTick(res(...args));
        timer = setTimeout((_) => {
          timer = null;
          return res(...args);
        }, time);
      });
    },

    async selectFile(name, title) {
      const ev = await electron.dialog.showOpenDialog({
        title: title,
        defaultPath: name,
        properties: ["openFile"],
      });

      //      console.log(ev);
      if (!ev.filePaths || !ev.filePaths.length) return null;
      return ev.filePaths[0];
    },

    async saveFileWindows(name, content) {
      //        console.log("Save file ", name, content);

      return electron.writeFile(name, content).then(
        (ret) => {
          this.$alert(`success:${this.$t("Saved file")} '${name}'!`);
          return ret;
        },
        (err) => {
          this.$alert(
            `error: ${this.$t("Save file error:")} ${err.toString()}`
          );
          return null;
        }
      );
    },

    async readFileWindows(name, ...options) {
      //        console.log("Save file ", name, content);

      return electron.readFile(name, ...options).then(
        (ret) => {
          this.$alert(`success:${this.$t("Read file")} '${name}'!`);
          return ret;
        },
        (err) => {
          this.$alert(
            `error:${this.$t(
              "Read file error when reading"
            )} ${name}:${err.toString()}`
          );
          return null;
        }
      );
    },

    async doCopyClipboard(text) {
      const that = this;
      if (!text) return text;
      if (typeof text !== "string") text = JSON.stringify(text, null, 2);
      electron.clipboard.writeText(text);
      if (this.$alert) this.$alert("2|success:Copied to clipboard!");
    },
  },
});

new Vue({
  vuetify,
  i18n,
  store,
  render: (h) => h(App),
}).$mount("#app");
