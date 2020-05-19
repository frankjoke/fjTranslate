import Vue from "vue";

import dictionary from "@/assets/words";
import inspect from "browser-util-inspect";

const toadd = {};
const mylang = navigator.language || navigator.userLanguage;
const vueProto = Vue.prototype;

function translate(what, ...args) {
  if (!what) return "";

  let i = 0;
  let dl = Vue.prototype.$llang || "en";
  //    debugger;
  let res = what;
  if (dictionary[what] && dictionary[what][dl]) res = dictionary[what][dl];
  else {
    let n = {
      //      [what]: {}
      //      "'" + what + "' for '" + dl + "' to be created/edited!"
    };
    if (!toadd[what]) {
      //      console.log("dictionary:", n);
      toadd[what] = n;
    }
    if (dl !== "en" && dictionary[what] && dictionary[what]["en"])
      res = dictionary[what]["en"];
  }
/* 
  while (i < args.length) {
    let rs = "$" + (i + 1).toString();
    while (res.indexOf(rs) !== -1) {
      res = res.replace(rs, args[i]);
    }
    i++;
  }
  */
  while ((i = res.match(/(\$\{([1-9])\})/)))
    res = res.replace(/(\$\{([1-9])\})/, inspect(args[Number(i[2] - 1)]));
  return res;
}

function importFile(r, opts) {
  opts = opts || {
    type: "JSON"
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
      r = "Error: file did not include json syntax!";
      vueProto.$alert(`error:JSON.parse: ${e}`);
    }
  } else if (type === "Javascript") {
    try {
      r = eval("(" + r + ")");
    } catch (e) {
      r = "Error: file could not be evaluated!";
      vueProto.$alert(`error:eval: ${e}`);
    }
  }
  return r;
}

function exportFile(what, opts) {
  if (what === undefined || what === null) return { str: "" };
  opts = opts || {
    type: typeof what === "string" ? "Text" : "JSON"
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
    skippedAtStart
  } = opts;
  const todoTypes = {
    JSON: {
      stringify: true,
      ending: ".json",
      mime: "application/json"
    },
    Javascript: {
      stringify: true,
      ending: ".js",
      mime: "application/javascript"
    },
    Text: {
      ending: ".txt",
      mime: "text/plain"
    }
  };
  let { stringify, ending, mime } = todoTypes[type] || todoTypes.Text;
  stringify = stringify || saveWithJSON;

  if (!name) {
    if (!fileName) name = (basename ? basename : "file") + ending;
    else name = fileName;
  }
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
    addAtStart + (stringify ? JSON.stringify(what, null, 2) : what) + addAtEnd;

  return {
    name,
    str,
    mime,
    ending
  };
}

function getTimeInterval(oldTime, hoursToShow) {
  hoursToShow = hoursToShow || 0;
  if (oldTime < 946681200000) oldTime = oldTime * 1000;

  var result = "";

  var newTime = new Date();

  if (!oldTime) return "";
  if (typeof oldTime === "string") {
    oldTime = new Date(oldTime);
  } else {
    if (typeof oldTime === "number") {
      oldTime = new Date(oldTime);
    }
  }

  var seconds = (newTime.getTime() - oldTime.getTime()) / 1000;

  if (hoursToShow && seconds / 3600 > hoursToShow) return "";
//  seconds = Math.floor(seconds / 5) * 5;

  if (seconds < 5) {
    result = translate("just now");
  } else if (seconds <= 60) {
    result = translate("${1} seconds ago", Math.floor(seconds));
  } else if (seconds <= 3600) {
    result = translate(
      "for ${1} min ${2} seconds.",
      Math.floor(seconds / 60),
      Math.floor(seconds % 60)
    );
  } else if (seconds <= 3600 * 24) {
    // between 1 und 24 hours
    var hrs = Math.floor(seconds / 3600);
    if (hrs === 1 || hrs === 21) {
      result = translate("for1Hour", hrs, Math.floor(seconds / 60) % 60);
    } else if (hrs >= 2 && hrs <= 4) {
      result = translate("for2-4Hours", hrs, Math.floor(seconds / 60) % 60);
    } else {
      result = translate("forHours", hrs, Math.floor(seconds / 60) % 60);
    }
  } else if (seconds > 3600 * 24 && seconds <= 3600 * 48) {
    result = translate("yesterday");
  } else if (seconds > 3600 * 48) {
    // over 2 days
    result = translate("for ${1} hours", Math.floor(seconds / 3600));
  }

  return result;
}

vueProto.$importFile = importFile;
vueProto.$exportFile = exportFile;
vueProto.$dictionary = {
  translate,
  dictionary,
  toadd,
  mylang,
  getTimeInterval
};
Vue.filter("tt", translate);
Vue.filter("ago", (value, arg) => {
  return getTimeInterval(value, arg);
});

export { translate, dictionary, toadd, mylang, getTimeInterval };
