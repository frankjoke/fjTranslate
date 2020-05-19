<template>
  <FjB v-bind="$attrs" @click="saveFile(content, opts, $event)" />
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
    saveFile(what, opts, e) {
      const { mime, str, name } = this.$exportFile(what, opts);
      if (!mime) return Promise.reject("invalid value to save!");

      if (e.shiftKey) {
        e.preventDefault();
        e.str = str.toString();
        this.$emit("shiftclick", e);
        return false;
      }

      const blob = new Blob([str], {
        type: mime + ";charset=utf-8"
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
