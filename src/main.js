import Vue from "vue";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";

import ConfigForm from "./components/ConfigForm";
//import FjB from "./components/FjB";
import FjBtn from "./components/FjBtn";
import FjFileLoadButton from "./components/FjFileLoadButton";
import FjFileSaveButton from "./components/FjFileSaveButton";
import FjAlerts from "./components/FjAlerts";

Vue.config.productionTip = false;
Vue.component("ConfigForm", ConfigForm);
Vue.component("FjB", FjBtn);
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
