import Vue from "vue";
import vuetify from "./plugins/vuetify";

import App from "./App.vue";

import ConfigForm from "./components/ConfigForm";
//import FjB from "./components/FjB";
import FjB from "./components/FjB";
import FjFileLoadButton from "./components/FjFileLoadButton";
import FjFileSaveButton from "./components/FjFileSaveButton";
import FjTimerRefresh from "./components/FjTimerRefresh";
import FjAlerts from "./components/FjAlerts";
import VueClipboard from "vue-clipboard2";
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
Vue.use(VueClipboard);
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
Vue.component("FjFileSaveButton", FjFileSaveButton);
//import { translate, dictionary, toadd } from "./plugins/dictionary";

Vue.directive("sticky", {
  bind(el, binding, vnode) {
    console.log(binding, vnode);
    /*     if (binding.arg == "bottom") {
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
 */
  }
});

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
