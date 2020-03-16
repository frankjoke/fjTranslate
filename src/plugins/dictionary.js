import Vue from "vue";

import dictionary from "../assets/words";

const toadd = {};

function translate(what, ...args) {
  if (!what) return "";

  let i = 0;
  let dl =
    (Vue.prototype.$store &&
      Vue.prototype.$store.state &&
      Vue.prototype.$store.state.lang) ||
    "en";
  //    debugger;
  let res = what;
  if (dictionary[what] && dictionary[what][dl]) res = dictionary[what][dl];
  else {
    let n = {
      [what]: "'" + what + "' for '" + dl + "' to be created/edited!"
    };
    if (!toadd[what]) {
//      console.log("dictionary:", n);
      toadd[what] = n;
    }
    if (dl !== "en" && dictionary[what] && dictionary[what]["en"])
      res = dictionary[what]["en"];
  }
  while (i < args.length) {
    let rs = "$" + (i + 1).toString();
    while (res.indexOf(rs) !== -1) {
      res = res.replace(rs, args[i].toString());
    }
    i++;
  }
  return res;
}

Vue.prototype.$dictionary = { translate, dictionary, toadd };
Vue.filter("tt", translate);

export { translate, dictionary, toadd };
