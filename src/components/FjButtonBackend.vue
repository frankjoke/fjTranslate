<template>
    <v-btn v-if="label" v-bind="$attrs" @click="click($event)">
      <span v-if="!iconleft">{{ label | tt }}</span>
      <v-icon
        v-if="!!img"
        v-bind="$attrs"
        :left="!iconleft"
        :right="!iconleft"
        >{{ img }}</v-icon
      >
      <span v-if="iconleft && label">{{ label | tt }}</span>
      <slot></slot>
    </v-btn>
    <v-icon v-else-if="!!img" v-bind="$attrs" @click="click($event)">
      {{ img }}
      <slot></slot>
    </v-icon>
    <v-icon v-else v-bind="$attrs" @click="click($event)">
      <slot></slot>
    </v-icon>
</template>

<script>
export default {
  name: "FjButtonBackend",

  inheritAttrs: false,
  props: {
    img: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    /*     disabled: {
      type: Boolean,
      default: false
    },
 */
    iconleft: {
      type: Boolean,
      default: false
    }
  },
  computed: {},
  methods: {
    click(event) {
      event.stopPropagation();
      //      if (!Array.isArray(event)) event = [event];
      console.log('I issue a click...');
      this.$emit("click", event);
    }
  },
  created() {
    //    console.log(this._uid, this.iconleft, this.label, this.img)0
  }
};
</script>
