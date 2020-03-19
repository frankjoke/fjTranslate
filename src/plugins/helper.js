/*
filter attributes into this_attrs and next_attrs
if there is a value named 'my_attrs' use it to filer 
 */

// @vue/component
import Vue from "vue";
import { translate, toadd, dictionary } from "./dictionary";

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
    consoleLog(...args) {
      console.log(...args);
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
    _(text) {
      text = this.tt(text);

      let pos = text.indexOf("%s");
      let count = 0;
      while (pos !== -1 && ++count <= arguments.length) {
        text = text.replace("%s", arguments[count]);
      }
      return text;
    },
    wait(time) {
      var timer;
      const that = this;
      return new Promise(res => {
        if (!time) return that.$nexttick(res());
        timer = setTimeout(() => {
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
 */ alert(
      text
    ) {
      if (!this.$alert) return console.log("alert", text);
      return this.$alert(text);
    },
    getTimeInterval(oldTime, hoursToShow) {
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
      seconds = Math.floor(seconds / 5) * 5;

      if (seconds < 5) {
        result = this._("just now");
      } else if (seconds <= 60) {
        result = this._("%s seconds ago", Math.floor(seconds));
      } else if (seconds <= 3600) {
        result = this._(
          "for %s min %s seconds.",
          Math.floor(seconds / 60),
          Math.floor(seconds % 60)
        );
      } else if (seconds <= 3600 * 24) {
        // between 1 und 24 hours
        var hrs = Math.floor(seconds / 3600);
        if (hrs === 1 || hrs === 21) {
          result = this._("for1Hour", hrs, Math.floor(seconds / 60) % 60);
        } else if (hrs >= 2 && hrs <= 4) {
          result = this._("for2-4Hours", hrs, Math.floor(seconds / 60) % 60);
        } else {
          result = this._("forHours", hrs, Math.floor(seconds / 60) % 60);
        }
      } else if (seconds > 3600 * 24 && seconds <= 3600 * 48) {
        result = this._("yesterday");
      } else if (seconds > 3600 * 48) {
        // over 2 days
        result = this._("for %s hours", Math.floor(seconds / 3600));
      }

      return result;
    }
  }
};

Vue.filter("ago", (value, arg) => {
  return helper.methods.getTimeInterval(value, arg);
});

export default helper;
