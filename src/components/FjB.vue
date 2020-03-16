<template>
  <v-tooltip v-if="tooltip" :bottom="bottom || !top" :top="top">
    <template v-slot:activator="{ on }">
      <FjButtonBackend v-bind="$attrs" v-on="on" @click.stop="$emit('click', $event)"></FjButtonBackend>
    </template>
    <span>{{ tooltip | tt }}</span>
    <slot></slot>
  </v-tooltip>
  <FjButtonBackend v-else v-bind="$attrs" @click.stop="$emit('click', $event)">
    <slot></slot>
  </FjButtonBackend>
</template>

<script>
import Vue from "vue";
import FjButtonBackend from "./FjBtn";

Vue.component("FjButtonBackend", FjButtonBackend);

export default {
  name: "FjB",

  // inheritAttrs: false,
  components: { FjButtonBackend },
  props: {
    tooltip: {
      type: String,
      default: ""
    },
    top: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    }
    /*     disabled: {
      type: Boolean,
      default: false
    },
 */
  },
  computed: {},
  methods: {},
  created() {
    //    console.log(this._uid, this.iconleft, this.label, this.img)0
  }
};
</script>
