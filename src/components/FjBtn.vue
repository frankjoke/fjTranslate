<template>
  <v-tooltip v-if="!!tooltip" v-bind="iconAttr" :top="mtop" :bottom="mbottom">
    <template v-slot:activator="{ on }">
      <v-btn
        :icon="!label"
        :small="!label"
        :disabled="disabled"
        v-on="on"
        style="margin-right: 5px; margin-left: 5px"
        @click="click($event)"
        v-bind="iconAttr"
      >
        <v-icon
          dense
          v-if="!!img && iconleft"
          :right="right"
          :left="left"
          v-bind="iconAttr"
        >{{ img }}</v-icon>
        <span v-if="!!label">{{ label | tt }}</span>
        <v-icon
          dense
          v-if="!!img && !iconleft"
          :right="right"
          :left="left"
          v-bind="iconAttr"
        >{{ img }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltip | tt }}</span>
    <slot></slot>
  </v-tooltip>
  <v-btn v-else-if="label" :disabled="disabled" @click="click($event)" v-bind="iconAttr">
    <v-icon
      dense
      v-if="!!img && iconleft"
      :right="right"
      :left="left"
      v-bind="iconAttr"
      @click="click($event)"
    >{{ img }}</v-icon>
    {{ label | tt }}
    <v-icon
      dense
      v-if="!!img && !iconleft"
      :right="right"
      :left="left"
      v-bind="iconAttr"
      @click="click($event)"
    >{{ img }}</v-icon>
    <slot></slot>
  </v-btn>
  <v-icon v-else-if="img" :disabled="disabled" :right="right" :left="left" v-bind="iconAttr" @click="click($event)">
    {{
    img
    }}
  </v-icon>
  <v-icon v-else :disabled="disabled" :right="right" :left="left" v-bind="iconAttr" @click="click($event)">
    <slot></slot>
  </v-icon>
</template>

<script>
//import attrsMixin from "../mixins/attrs";
// import translateMixin from "../mixins/translate";

export default {
  name: "FjBtn",
  inheritAttrs: false,

  //  mixins: [attrsMixin],
  data() {
    //    return { my_attrs: "top,bottom,left,right" };
    return {
      iconAttr: {},
      left: false,
      right: false,
      mtop: false,
      mbottom: false
    };
  },
  props: {
    img: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    tooltip: {
      type: String,
      default: ""
    },
    /*     disabled: {
      type: Boolean,
      default: false
    },
 */ top: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },

    iconleft: {
      type: Boolean,
      default: false
    },
    iconright: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click(event) {
      event.stopPropagation();
      //      if (!Array.isArray(event)) event = [event];
      this.$emit("click", event);
    }
  },
  created() {
    //    console.log(this.$attrs);
    const { left, right, top, bottom } = this.$attrs;
    this.left = left || (this.iconleft && !!this.label);
    this.right = right || (!this.iconleft && !!this.label);
    const natt = Object.assign({}, this.$attrs);
    delete natt.left;
    delete natt.right;
    //    natt.disabled = this.disabled;
    if (natt.text !== undefined) natt.text = true;
    if (natt.small !== undefined) natt.small = true;
    if (this.botton || !this.top) this.mbottom = true;
    else if (this.top) this.mtop = true;
    //    if (!this.iconleft && !natt.left) natt.left = true;
    //    console.log(this.left, this.right, this.label, this.iconleft, natt);
    this.iconAttr = natt;
  }
};
</script>

<style>
/* .v-icon {
  margin-left: 0.2em;
  margin-right: 0.2em;
}
.v-image {
  margin-left: 0.1em;
  margin-right: 0.1em;
}
 */
</style>
