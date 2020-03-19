import Vue from "vue";
import vuetify from "./plugins/vuetify";

import App from "./App.vue";

import ConfigForm from "./components/ConfigForm";
//import FjB from "./components/FjB";
import FjB from "./components/FjB";
import FjFileLoadButton from "./components/FjFileLoadButton";
import FjFileSaveButton from "./components/FjFileSaveButton";
import FjAlerts from "./components/FjAlerts";

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
Vue.component("FjFileLoadButton", FjFileLoadButton);
Vue.component("FjFileSaveButton", FjFileSaveButton);
import { translate, dictionary, toadd } from "./plugins/dictionary";
//import filters from "./plugins/filters.js";
Vue.prototype.$dictionary = {
  translate,
  dictionary,
  toadd
};

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
