<template>
  <v-card raised class="ma-1">
    <v-card-title class="subtitle-1">
      <v-icon V-if="icon" left small>{{ icon }}</v-icon>
      {{ $t(label) }}
    </v-card-title>
    <v-container fluid>
      <v-row align="center">
        <v-col class="d-flex" cols="12" sm="2">
          <v-select
          class="body-2"
            auto-select-first
            :label="$t('type')"
            :hint="
              $t(
                'The language which you will work in to base the translations on'
              )
            "
            :items="['JSON', 'Javascript', 'Text']"
            hide-details="auto"
            v-model="value.type"
            dense
          ></v-select>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <span class="body-2">
            {{
              isJson
                ? $t("Read as JSON")
                : isJavascript
                ? $t("Read as eval")
                : $t("Read as text")
            }}
            <br />
            {{ $t(isJson || isJavascript ? "Write as JSON" : "Write as text") }}
          </span>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <v-text-field
            :disabled="isJson"
            type="text"
            :label="$t('Skip At Start')"
            :hint="$t('Remove all text until this string at file on load')"
            hide-details="auto"
            v-model="value.skipAtStart"
            dense
          ></v-text-field>
        </v-col>
        <v-col class="d-flex" cols="12" sm="2">
          <v-text-field
            :disabled="isJson"
            type="text"
            :label="$t('Skip After End')"
            :hint="$t('Remove all text after this string at end file on load')"
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
            :label="$t('Add At Start')"
            :hint="$t('Add this text at start on save')"
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
            :label="$t('Add at End')"
            :hint="$t('Add this Text at End on save')"
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
      <v-row>
        <v-col cols="2">
          <v-checkbox
            dense
            :label="$t('Autoload')"
            v-model="value.autoload"
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col cols="2">
          <v-checkbox
            dense
            :label="$t('Autosave')"
            v-model="value.autosave"
            hide-details

          ></v-checkbox>
        </v-col>
        <v-col cols="8">
          <v-text-field
            class="body-2"
            dense
            prepend-icon="mdi-folder-open"
            @click:prepend="selectfilename(value)"
            :label="$t('Filename:')"
            v-model="value.fileName"
          ></v-text-field>
        </v-col>
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
        fileName: "",
        saveWithJSON: true,
      }),
      required: true,
    },
    icon: {
      type: String,
      default: "",
      required: false,
    },
    label: {
      type: String,
      default: "",
      required: false,
    },
  },
  computed: {
    isJson() {
      return this.value.type == "JSON";
    },
    isJavascript() {
      return this.value.type == "Javascript";
    },
  },
  // watch: {},
  /*     value: {
      // This will let Vue know to look inside the array
      deep: true,

      // We have to move our method to a handler field
      handler(oldV, newV) {
        console.log("something changed!", oldV, newV);
      },
    },
 */
  methods: {
    async selectfilename(val) {
      await this.$nextTick();
      //      console.log("try to select file for ", val);
      const file = await this.selectFile(
        val.fileName,
        this.$t("Select file") + " " + this.label
      );
      if (!file) return null;
      this.$set(val, "fileName", file);
      await this.wait(2);
      this.$forceUpdate();
    },
  },
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
  },
};
</script>
