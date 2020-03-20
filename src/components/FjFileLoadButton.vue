<template>
  <!--
        <div>
     <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary darken-1"
    ></v-progress-linear>
  -->
  <FjB
    v-bind="$attrs"
    :label="over ? droplabel : label"
    @click.stop="triggerLoad"
    :loading="loading"
    :disabled="loading"
    :class="over ? dropclass : ''"
  >
    <input
      type="file"
      :id="myId"
      style="display:none"
      @change="loadTextFromFile"
    />
  </FjB>
  <!--   </div>
  -->
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
    },
    dropclass: {
      type: String,
      default: "success"
    },
    label: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      default: ""
    },
    droplabel: {
      type: String,
      default: "Drop here"
    }
  },
  data() {
    return {
      loading: false,
      drop: false,
      over: false
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
      this.$nextTick(_ => {
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
          this.$alert &&
            this.message &&
            this.$alert(`info:${this.message} loaded!`);
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
    const that = this;
    this.drop = typeof window.FileReader !== "undefined";
    //    console.log(this.$el, "FileReader supported:", this.drop);
    const holder = this.$el;
    if (this.drop) {
      holder.ondragenter = function() {
        that.over = true;
        return false;
      };
      holder.ondragover = function() {
        that.over = true;
        return false;
      };
      holder.ondragleave = function() {
        that.over = false;
        return false;
      };
      holder.ondrop = function(e) {
        that.over = false;
        e.preventDefault();
        e.target.files = e.dataTransfer.files;
        that.$nextTick().then(_ => that.loadTextFromFile(e));
        return false;
      };
    }

    //    console.log(this.myId, this.opts);
  },
  unmounted() {
    //    console.log(this.$el);
    if (this.drop) {
      const holder = this.$el;
      holder.ondragenter = null;
      holder.ondragover = null;
      holder.ondragleave = null;
      holder.ondrop = null;
    }
  }
  /*
var holder = document.getElementById('holder'),
    state = document.getElementById('status');

if (typeof window.FileReader === 'undefined') {
    state.className = 'fail';
} else {
    state.className = 'success';
    state.innerHTML = 'File API & FileReader available';
}

holder.ondragover = function() {
    this.className = 'hover';
    return false;
};
holder.ondragend = function() {
    this.className = '';
    return false;
};
holder.ondrop = function(e) {
    this.className = '';
    e.preventDefault();

    var file = e.dataTransfer.files[0],
        reader = new FileReader();
    reader.onload = function(event) {
        console.log(event.target);
        holder.innerText = event.target.result;
    };
    console.log(file);
    reader.readAsText(file);

    return false;
};
*/
};
</script>
