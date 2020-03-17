<template>
  <v-card raised class="ma-1">
    <v-card-title class="subtitle-1">
      <v-icon V-if="icon" left small>{{ icon }}</v-icon>
      {{ label | tt }}
    </v-card-title>
    <v-container fluid>
      <v-row align="center">
        <v-col class="d-flex" cols="12" sm="2">
          <v-select
            auto-select-first
            label="type"
            hint="The language which you will work in to base the translations on"
            :items="['JSON', 'Javascript', 'Text']"
            hide-details="auto"
            v-model="value.type"
            dense
          ></v-select>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <span class="body-2">
            {{
              tt(
                isJson
                  ? "Read as JSON"
                  : isJavascript
                  ? "Read as eval"
                  : "Read as text"
              )
            }}
            <br />
            {{ tt(isJson || isJavascript ? "Write as JSON" : "Write as text") }}
          </span>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <v-text-field
            :disabled="isJson"
            type="text"
            label="Skip At Start"
            hint="Remove all text until this string at file on load"
            hide-details="auto"
            v-model="value.skipAtStart"
            dense
          ></v-text-field>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <v-text-field
            :disabled="isJson"
            type="text"
            label="Skip After End"
            hint="Remove all text after this string at end file on load"
            hide-details="auto"
            v-model="value.skipAfterEnd"
            dense
          ></v-text-field>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <v-text-field
            class="body-2"
            :disabled="isJson"
            type="text"
            label="Add At Start"
            hint="Add this text at start on save"
            hide-details="auto"
            v-model="value.addAtStart"
            dense
          ></v-text-field>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <v-text-field
            class="body-2"
            :disabled="isJson"
            type="text"
            label="Add at End"
            hint="Add this Text at End on save"
            hide-details="auto"
            v-model="value.addAtEnd"
            dense
          ></v-text-field>
        </v-col>
        <!--       <v-combobox
        label="locales to edit/create"
        hint="The languages you want to translate the devLocale into separated by ','"
        :rules="[value => !!value || 'required']"
        :disabled="all"
        hide-details="auto"
        :items="allLocalesList"
        v-model="locales"
        multiple
        chips
      ></v-combobox>

    <v-col class="d-flex" cols="12" sm="2">
       <v-switch v-model="useYandex" class="ma-2" label="Use Yandex Translator"></v-switch>
    </v-col>
        -->
      </v-row>
    </v-container>
    <!--     </v-card-subtitle>
    -->
  </v-card>
</template>

<script>
import helperMixin from "../plugins/helper";

export default {
  name: "ConfigFile",
  mixins: [helperMixin],
  data() {
    return {};
  },

  props: {
    value: {
      type: Object,
      default: () => ({
        type: "Text",
        skipAtStart: "",
        skipAfterEnd: "",
        addAtStart: "",
        addAtEnd: "",
        saveWithJSON: type == "JSON"
      }),
      required: true
    },
    icon: {
      type: String,
      default: "",
      required: false
    },
    label: {
      type: String,
      default: "",
      required: false
    }
  },
  computed: {
    isJson() {
      return this.value.type == "JSON";
    },
    isJavascript() {
      return this.value.type == "Javascript";
    }
  },
  watch: {
    value(oldV, newV) {
      console.log("something changed!", oldV, newV);
    }
  },
  methods: {},
  created() {
    //    console.log("value:", this.value, "icon:", this.icon);
    /*     this.$store.watch(
      (state, getters) => state.config,
      (newV, oldV) => {
        //        console.log(newV, oldV);
        this.loadConf();
      }
    );
 */
  }
};
</script>
