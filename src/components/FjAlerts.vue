<template>
  <div>
    <v-menu
      v-if="items.length"
      dense
      :value="true"
      offset-y
      :position-x="posx"
      :position-y="posy"
      :close-on-content-click="false"
      :close-on-click="false"
      mode="out-in"
      transition="scale-transition"
    >
      <transition name="slide-fade" v-for="(item, index) in items" :key="index">
        <v-alert
          mode="in-out"
          origin="transform-origin: -100% 50%;"
          border="left"
          :color="item.color"
          dense
          :type="item.type"
          :label="item.label"
          elevation="5"
          class="ma-2"
        >
          <template v-slot:append>
            <FjB
              class="ml-1"
              dense
              text
              :label="label"
              img="mdi-close"
              @click.stop="deleteAlert(index)"
            ></FjB>
          </template>
          <span>{{ item.text }}</span>
        </v-alert>
      </transition>
    </v-menu>
    <slot></slot>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "FjAlerts",
  props: {
    selector: {
      type: String,
      default: ""
    },
    offsetX: {
      type: Number,
      default: 0
    },
    offsetY: {
      type: Number,
      default: 0
    },
    timeout: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      posx: 0,
      posy: 0,
      idCount: 0,
      items: [],
      label: ""
    };
  },
  methods: {
    addAlert(options) {
      const that = this;
      options = options || {};
      if (typeof options === "string") {
        let text = options.trim();
        const types = ["warning", "error", "info", "success", "primary"];
        let res = types.filter(v => text.startsWith(v + ":"));
        if (res.length) {
          res = res[0];
          options = {
            text: text.slice(res.length + 1).trim(),
            type: res,
            label: "",
            timeout: 6
          };
        } else options = { text, color: "primary lighten-4" };
      }
      options = Object.assign(
        {
          timeout: this.timeout,
          id: this.idCount++,
          text: "(empty)"
        },
        options
      );
      //      options.type = this.random(["error", "warning", "info", "success"]);
      //      options.color = options.color || options.type + " darken-2";
      if (options.label) this.label = options.label;
      if (options.timeout) {
        const id = options.id;
        options.hastimeout = setTimeout(() => {
          options.hastimeout = null;
          const index = that.items.findIndex(i => i.id === id);
          //          console.log("will delete", index);
          if (index >= 0) that.items.splice(index, 1);
        }, options.timeout * 1000);
      }
      this.items.unshift(options);
      return Promise.resolve(null);
    },
    deleteAlert(index) {
      //      console.log("Delete Item:", index, item, event);
      if (this.items[index].hastimeout) {
        clearTimeout(this.items[index].hastimeout);
        this.items[index].hastimeout = null;
      }
      this.items.splice(index, 1);
    },
    random(start, end) {
      if (Array.isArray(start))
        return start[Math.floor(Math.random() * start.length)];
      if (typeof end === "number") return Math.random() * (end - start) + start;
      if (typeof start === "number") return Math.random() * start;
      return Math.random();
    }
  },
  created() {
    Vue.prototype.$alert = this.addAlert.bind(this);
  },
  beforeDestroy() {
    while (this.items.length > 0) this.deleteAlert(0);
  },
  mounted() {
    this.$nextTick(() => {
      const ref = this.$el;
      //   console.log(this.$refs, this.$refs.refgnbtn.$el);
      this.posx = ref.getBoundingClientRect().left + this.offsetX;
      this.posy = ref.getBoundingClientRect().bottom + this.offsetY;
    });
  }
};
</script>
<style>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.6s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translatex(100px);
  opacity: 0;
}
.v-menu__content {
  transition: all 0.3s ease;
}
</style>
