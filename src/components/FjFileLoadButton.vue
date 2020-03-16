<template>
  <div>
    <!--     <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary darken-1"
    ></v-progress-linear>
    -->
    <FjB v-bind="$attrs" @click.stop="triggerLoad" :loading="loading" :disabled="loading">
      <input type="file" :id="myId" style="display:none" @change="loadTextFromFile" />
    </FjB>
  </div>
</template>

<script>
export default {
  name: "FjFileLoadButton",

  //  inheritAttrs: false,
  props: {
    opts: {
      type: Object,
      default: () => ({
        type: "Text",
        basename: "FileLoadButton"
      })
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    myId() {
      const id =
        (this.opts.basename || "FileLoadButton_") + this._uid.toString();
      //      console.log("fileLoadBiutton:", id);
      return id;
    }
  },
  watch: {},
  methods: {
    loadTextFromFile(ev) {
      //      console.log(ev);
      if (!ev.target.files || !ev.target.files.length) {
        this.loading = false;
        if (ev.target.value)
          this.$alert(
            "warning:Browser does not load same file again!",
            (this.loading = false)
          );
      }
      this.loading = true;
      const file = ev.target.files[0];
      const reader = new FileReader();
      this.$nextTick(() => {
        this.opts.name = file.name;
        //      debugger;
        //      console.log(ev.target.value, reader);
        reader.onload = e => {
          let r = e.target.result;
          if (this.opts.skipAtStart && r.indexOf(this.opts.skipAtStart) > 0)
            r = r.slice(r.indexOf(this.opts.skipAtStart));
          if (
            this.opts.skipAfterEnd &&
            r.lastIndexOf(this.opts.skipAfterEnd) > 0
          )
            r = r.slice(0, r.lastIndexOf(this.opts.skipAfterEnd) + 1);
          if (this.opts.type === "JSON") {
            try {
              r = JSON.parse(r);
            } catch (e) {
              r = "Error: file did not include json syntax!";
              this.$alert(`error:JSON.parse: ${e}`);
            }
          } else if (this.opts.type === "Javascript") {
            try {
              r = eval("(" + r + ")");
            } catch (e) {
              r = "Error: file could not be evaluated!";
              this.$alert(`error:eval: ${e}`);
            }
          }

          //        console.log("results text:", r);
          this.$emit("onchange", r);
          this.loading = false;
          //        this.value = r;
          //        return r;
          //       this.$emit("load", e.target.result);
        };
        reader.readAsText(file);
      }, this);
    },
    triggerLoad() {
      //      debugger;
      const el = document.getElementById(this.myId);
      //      console.log(this.myId, "trigger:", el);
      el.value = null;
      el.click();
    }
    /*     focus(e) {
      console.log(e);
    }
 */
  },
  created() {
    //    console.log(this._uid, this.iconleft, this.label, this.img)0
  },
  mounted() {
    //    console.log(this.myId, this.opts);
  }
};
</script>
