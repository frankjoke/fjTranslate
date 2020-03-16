<template>
  <FjB v-bind="$attrs" @click="saveFile(content, opts)"/>
</template>

<script>
import { saveAs } from "file-saver";

export default {
  name: "FjFileSaveButton",
//  inheritAttrs: false,
  props: {
    content: {
      type: Object,
      default: () => "empty file!"
    },
    opts: {
      type: Object,
      default: () => ({
        type: "Text"
      })
    }
  },
  computed: {},
  methods: {
    saveFile(what, opts) {
      let { type, addAtStart, addAtEnd, saveWithJSON, name, basename } = opts;
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
      const todo = todoTypes[type] || todoTypes.Text;
      if (saveWithJSON) todo.stringify = true;

      if (!name) name = (basename ? basename : "file") + todo.ending;

      if (!what) return Promise.reject("invalid value to save!");
      addAtStart = addAtStart || "";
      addAtStart = addAtStart.split("\\n").join("\n");
      addAtEnd = addAtEnd || "";
      addAtEnd = addAtEnd.split("\\n").join("\n");
      //    debugger;
      const str =
        addAtStart +
        (todo.stringify ? JSON.stringify(what, null, 2) : what) +
        addAtEnd;
      const blob = new Blob([str], {
        type: todo.mime + ";charset=utf-8"
      });
      //      console.log(name, prepend, value, typ, str);
      return saveAs(blob, name);
    }
  },
  created() {
    //    console.log(this._uid, this.iconleft, this.label, this.img)0
  },
  mounted() {}
};
</script>
