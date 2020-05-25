<template>
  <v-dialog v-model="show" scrollable max-width="95%">
    <template v-slot:activator="{ on }">
      <FjB v-bind="$attrs" v-on="on" />
    </template>
    <v-card>
      <v-card-title class="title grey lighten-2 py-2">
        <span>{{ title }}</span>
        <v-spacer></v-spacer>
        <v-icon v-if="!!icon">{{ icon }}</v-icon>
      </v-card-title>
      <v-card-text max-height="80%">
        <ConfigFile
          :value.sync="myConf.editWordsFile"
          :label="$t('Words file config:')"
          icon="mdi-folder"
        />
        <ConfigFile
          :value.sync="myConf.globalWordsFile"
          :label="$t('Global translation file:')"
          icon="mdi-briefcase"
        />
        <v-card raised class="ma-1">
          <v-card-title class="subtitle-1">
            <v-icon small left>mdi-google-translate</v-icon>
            <span>Language Settings:</span>
          </v-card-title>
          <v-container fluid class="py-1">
            <v-row align="center">
              <v-col cols="12" class="px-4 py-1">
                <v-combobox
                  v-model="myConf.allLocales"
                  :items="[]"
                  dense
                  small-chips
                  multiple
                  cache-items
                  deletable-chips
                  hide-selected
                  :hint="
                    $t('Add/remove languages you want to be able to process')
                  "
                  persistent-hint
                >
                  <template v-slot:selection="data">
                    <v-chip
                      :input-value="data.selected"
                      :key="JSON.stringify(data.item)"
                      v-bind="data.attrs"
                      close
                      @click:close="removeLang(data.item)"
                    >
                      <span>{{ data.item }}</span
                      >&nbsp;
                    </v-chip>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="d-flex pl-4 pr-0 py-1" cols="12" sm="2">
                <v-select
                  dense
                  :label="$t('devLocale')"
                  :hint="
                    $t(
                      'The language which you will work in to base the translations on'
                    )
                  "
                  :items="myConf.allLocales"
                  hide-details="auto"
                  v-model="myConf.devLocale"
                ></v-select>
              </v-col>
              <v-col class="d-flex pl-2 pr-1 py-1" cols="12" sm="2">
                <v-switch
                  dense
                  v-model="all"
                  class="ma-2"
                  :label="all ? $t('All remaining') : $t('Select yourself')"
                ></v-switch>
              </v-col>
              <v-col class="d-flex pl-1 pr-3 py-1" cols="12" sm="8">
                <v-combobox
                  dense
                  :label="$t('locales to edit/create')"
                  :hint="
                    $t('The languages you want to translate the devLocale into')
                  "
                  :rules="[(value) => !!value || 'required']"
                  :disabled="all"
                  hide-details="auto"
                  :items="allLocalesList"
                  v-model="myConf.locales"
                  multiple
                  chips
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="d-flex pl-2 pr-0 py-1" cols="12" sm="2">
                <v-switch
                  dense
                  v-model="myConf.useYandex"
                  class="ma-2"
                  :label="$t('Use Yandex first')"
                ></v-switch>
              </v-col>
              <v-col class="d-flex pl-1 pr-3 py-1" cols="12" sm="10">
                <v-text-field
                  class="caption"
                  dense
                  :type="passwd ? 'password' : 'text'"
                  :label="$t('Yandex API key')"
                  append-icon="mdi-eye"
                  :placeholder="
                    $t(
                      yandexapi
                        ? 'Already defined in FJTRANSLATE_YANDEXKEY environment settings!'
                        : 'The Yandex.Translate API key, you can put it also in FJTRANSLATE_YANDEXKEY env settings!'
                    )
                  "
                  :rules="[
                    (value) =>
                      !value ||
                      value.length > 20 ||
                      $t(
                        'required for Yandex if not defined in FJTRANSLATE_YANDEXKEY env settings!'
                      ),
                  ]"
                  hide-details="auto"
                  v-model="myConf.yandexKey"
                  @click:append="passwd = !passwd"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <v-checkbox
                  dense
                  :label="$t('AutoSave config')"
                  v-model="myConf.autosave"
                  :disabled="!allowAutosave"
                ></v-checkbox>
              </v-col>
              <v-col cols="10">
                <v-text-field
                  dense
                  prepend-icon="mdi-folder-open"
                  @click:prepend="selectfilename"
                  :label="$t('Config Filename:')"
                  :hint="
                    $t(
                      'If filename is stored in FJTRANSLATE_CONFIG env settings  config will load automatically!'
                    )
                  "
                  v-model="myConf.configFile"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-card-text>
      <v-card-actions class="pt-0 pb-1">
        <FjFileLoadButton
          text
          img="mdi-upload"
          :label="$t('Load Config File')"
          iconleft
          @onchange="
            (path) =>
              loadTextFromFile(
                path,
                { type: 'JSON', name: myConf.configFile },
                $t('load Config File')
              ).then((x) => (myconf = x))
          "
          :droplabel="$t('Drop config file here')"
          :tooltip="$t('open file selector for config file or drop it here')"
        />
        <FjB
          :disabled="!changed"
          text
          img="mdi-download"
          :label="$t('Save config file')"
          iconleft
          @click.stop="
            saveFile(
              { fjTranslate: myConf },
              { type: 'JSON', name: myConf.configFile },
              $event
            )
          "
          :tooltip="
            $t(
              'save config to file or with shift to clipboard, select new file with alt'
            )
          "
        />
        <v-spacer></v-spacer>
        <FjB
          color="teal"
          text
          :label="$t('Save')"
          @click.stop="saveClose"
          :disabled="!changed"
          img="mdi-check"
          :tooltip="$t('save config to memory and to file if autosave is on')"
        />
        <FjB
          color="primary"
          text
          @click.stop="show = false"
          img="mdi-cancel"
          :label="$t('Close')"
          :tooltip="$t('exit config without saving')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ConfigFile from "./ConfigFile";
import helperMixin from "../plugins/helper";

export default {
  name: "ConfigForm",
  mixins: [helperMixin],

  data() {
    return {
      myConf: {},
      tempLocales: [],
      //      yandexKey: "",
      allLocales: [],
      all: true,
      passwd: true,
      origConf: "",
      yandexapi: process.env.FJTRANSLATE_YANDEXKEY,
    };
  },
  components: { ConfigFile },
  props: {
    title: {
      type: String,
      default: "",
      required: true,
    },
    icon: {
      type: String,
      default: "",
      required: false,
    },
    // showConfigForm: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
  },
  computed: {
    locales: {
      get() {
        const loc = (this.all ? this.allLocales : this.tempLocales).filter(
          (v) => v !== this.devLocale
        );
        return loc;
      },
      set(value) {
        this.tempLocales = value;
      },
    },
    show: {
      get() {
        return this.showConfigForm;
      },
      set(value) {
        this.showConfigForm = value;
      },
    },

    changed() {
      return this.myStringify(this.myConf) != this.origConf;
    },
    allLocalesList() {
      return this.allLocales.filter((v) => v !== this.devLocale);
    },
    allowAutosave() {
      return this.myConf.configFile !== "./cofig.json";
    },
  },
  watch: {
    showConfigForm: {
      deep: true,
      async handler(newi) {
        // console.log("showConfigForm ganged to", newi);
        this.show = newi;
        if (newi) await this.loaded(this.config);
        this.origConf = this.myStringify(this.myConf);
      },
    },

    all(newi) {
      if (newi)
        this.locales = this.allLocales.filter((v) => v !== this.devLocale);
    },
    /*     config: {
      // This will let Vue know to look inside the array
      deep: true,

      // We have to move our method to a handler field
      async handler(newConf) {
        //        console.log("something changed in config!", newConf);
        await this.loaded(newConf);
        this.origConf = this.myStringify(this.myConf);
      },
    },
 */
  },
  methods: {
    async selectfilename() {
      await this.$nextTick();
      //      console.log("try to select file for ", val);
      const file = await this.selectFile(
        this.myConf.configFile,
        this.$t("Select config file:")
      );
      if (!file) return null;
      this.$set(this.myConf, "configFile", file);
      await this.wait(2);
      this.$forceUpdate();
    },

    //    ...mapActions(["saveFile", "saveConfig"]),
    removeLang(what) {
      //      console.log("remove:", what);
      if (this.allLocales.indexOf(what >= 0))
        this.allLocales.splice(this.allLocales.indexOf(what >= 0), 1);
    },

    async save() {
      const conf = this.myConf;
      this.$emit("input", conf);
      if (conf.autosave)
        await this.saveFileWindows(
          conf.configFile,
          this.myStringify({ fjTranslate: conf }, true)
        );
      return conf;
    },

    saveClose() {
      this.save();
      this.showConfigForm = false;
    },

    async loaded(conf) {
      //      debugger;
      if (conf && conf.fjTranslate) conf = conf.fjTranslate;
      conf = Object.assign(
        {
          devLocale: "en",
          configFile: "./cofig.json",
          autosave: false,
          allLocales: [
            "en",
            "de",
            "ru",
            "pt",
            "nl",
            "fr",
            "it",
            "es",
            "pl",
            "zh-cn",
          ],
          locales: ["de", "ru", "pt", "nl", "fr", "it", "es", "pl", "zh-cn"],
          useYandex: false,
          globalWordsFile: {
            addAtEnd: "!",
            addAtStart: "!",
            skipAfterEnd: "}",
            skipAtStart: "{",
            type: "JSON",
          },
          editWordsFile: {
            addAtEnd: "!",
            addAtStart: "!",
            skipAfterEnd: "}",
            skipAtStart: "{",
            type: "Javascript",
          },
          yandexKey: "",
        },
        conf || {}
      );
      this.myConf = {};
      for (const item of Object.entries(conf)) {
        const [key, value] = item;
        this.$set(this.myConf, key, value);
      }
      await this.wait(1);
      this.$forceUpdate();
    },
  },
  // created() {},
  // beforeMount() {},
  async mounted() {
    await this.wait(100);
    this.loaded(this.copyObject(this.config));
    this.origConf = this.myStringify(this.myConf);
    this.myConf.autosave = this.allowAutosave && this.myConf.autosave;
    await this.wait(10);
    this.$forceUpdate();
  },
};
</script>
