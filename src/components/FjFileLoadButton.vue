<template>
  <FjB
    v-bind="$attrs"
    :label="over ? droplabel : label"
    @click.stop="$emit('onchange', '', $event)"
    :class="over ? dropclass : ''"
    :title="tooltip"
  ></FjB>
  <!--   </div>
  -->
</template>

<script>
// import helperMixin from "../plugins/helper";

export default {
  name: "FjFileLoadButton",
  // mixins: [helperMixin],

  //  inheritAttrs: false,
  props: {
    // opts: {
    //   type: Object,
    //   default: () => ({
    //     type: "Text",
    //     path: "./",
    //     basename: "FileLoadButton",
    //   }),
    // },
    dropclass: {
      type: String,
      default: "success",
    },
    label: {
      type: String,
      default: "",
    },
    droplabel: {
      type: String,
      default: "",
    },
    tooltip: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // loading: false,
      drop: false,
      over: false,
    };
  },
  // computed: {
  //   myId() {
  //     return "FileLoadButton_" + this._uid.toString();
  //   },
  // },
  // watch: {},
  // methods: {},
  // created() {},
  mounted() {
    const that = this;
    const holder = this.$el;
    const drop = !!that.droplabel;

    that.drop = drop;
    // console.log(
    //   holder,
    //   "FileReader supported:",
    //   drop,
    //   typeof window.FileReader !== "undefined"
    // );
    if (drop) {
      holder.ondragleave = holder.ondragover = holder.ondragenter = function () {
        that.over = true;
        return false;
      };
      holder.ondragleave = function () {
        that.over = false;
        return false;
      };
      holder.ondrop = function (e) {
        that.over = false;
        e.preventDefault();
        const path =
          e.dataTransfer.files &&
          e.dataTransfer.files.length &&
          e.dataTransfer.files[0] &&
          e.dataTransfer.files[0].path;
        // console.log("OnDrop:", path, e);
        // that.$nextTick().then((_) => that.loadTextFromFile(e));
        that.$nextTick().then((_) => that.$emit("onchange", path, e));
        return false;
      };
    }

    //    console.log(this.myId, this.opts);
  },
  unmounted() {
    //    console.log(this.$el);
    if (this.drop) {
      const holder = this.$el;
      holder.ondragenter = holder.ondragover = holder.ondragleave = holder.ondrop = null;
    }
  },
};
</script>
