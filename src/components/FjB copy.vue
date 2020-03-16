<template>
  <v-tooltip v-if="tooltip" :bottom="bottom || !top" :top="top">
    <template v-slot:activator="{ on }">
      <FjButtonBackend
        v-bind="$attrs"
        v-on="on"
        @click="click($event)"
        :label="label"
        :img="img"
        :title="tooltip"
      >
        <slot></slot>
      </FjButtonBackend>
    </template>
    <span>{{ tooltip | tt }} xxxxxx</span>
  </v-tooltip>
  <FjButtonBackend
    v-else
    v-bind="$attrs"
    @click="click($event)"
    :label="label"
    :img="img"
    :title="tooltip"
  >
    <slot></slot>
  </FjButtonBackend>
</template>

<script>
import Vue from "vue";
import FjButtonBackend from "./FjButtonBackend";

Vue.component("FjButtonBackend", FjButtonBackend);

export default {
  name: "FjB",

  // inheritAttrs: false,
  components: { FjButtonBackend },
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
    top: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    },
    /*     disabled: {
      type: Boolean,
      default: false
    },
 */
  },
  computed: {
  },
  methods: {
    inputListeners: function(on) {
      const vm = this;
      // `Object.assign` merges objects together to form a new object
      return Object.assign(
        {},
        // We add all the listeners from the parent
        this.$listeners,
        on ? on : {}
        /* ,
        /// If you need to add listeners tho this 
        // Then we can add custom listeners or override the
        // behavior of some listeners.
        {
          // This ensures that the component works with v-model
          input: function(event) {
            vm.$emit("input", event.target.value);
          }
        } */
      );
    },
    click(event) {
      event.stopPropagation();
      //      if (!Array.isArray(event)) event = [event];
      this.$emit("click", event);
    }
  },
  created() {
    //    console.log(this._uid, this.iconleft, this.label, this.img)0
  }
};
</script>
