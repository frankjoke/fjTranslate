<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text" v-text="options.title" />
      </v-toolbar>
      <v-card-text v-show="!!options.message" class="pa-4" v-html="options.message" />
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn :color="options.okColor" text @click.native="agree">
          <v-icon v-if="options.okIcon" left v-text="options.okIcon" />
          {{ options.okText }}
        </v-btn>
        <v-btn :color="options.cancelColor" text @click.native="cancel">
          {{ options.cancelText }}
          <v-icon v-if="options.cancelIcon" right v-text="options.cancelIcon" />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * Original from https://gist.github.com/eolant/ba0f8a5c9135d1a146e1db575276177d
 * Vuetify Confirm Dialog component
 *
 */

import Vue from "vue";

export default {
  data: () => ({
    dialog: false,
    resolve: null,
    options: {}
  }),
  props: {
    defaults: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    open(message, options) {
      options = options || {};
      if (!options.title && message.indexOf(":") > 0) {
        let pos = message.indexOf(":");
        if (message[pos + 1] == ":") ++pos;
        options.title = message.slice(0, pos);
        options.message = message.slice(pos + 1).trim();
      } else options.message = message;

      if (!options.title) options.title = "Please confirm:";

      this.title = options.title;
      this.message = options.message;
      this.options = Object.assign(
        {},
        this.options,
        Object.assign(
          {
            color: "primary",
            cancelColor: "grey darken-1",
            okColor: "success darken-1",
            okText: "Yes",
            okIcon: "mdi-check",
            cancelIcon: "mdi-close",
            cancelText: "No",
            width: 390,
            zIndex: 200
          },
          this.defaults,
          options
        )
      );
      this.dialog = true;
      return new Promise(resolve => {
        this.resolve = resolve;
      });
    },
    agree() {
      this.$nextTick().then(_ => this.resolve(true));
      this.dialog = false;
    },
    cancel() {
      this.$nextTick().then(_ => this.resolve(false));
      this.dialog = false;
    }
  },
  created() {
    Vue.prototype.$fjConfirm = this.open.bind(this);
  },
  mounted() {
    //    console.log("FjConfirm mounted:", Vue.prototype);
  }
};
</script>
