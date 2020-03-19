<template>
  <v-dialog v-model="show" max-width="900px">
    <template v-slot:activator="{ on }">
      <FjB v-bind="$attrs" v-on="on" />
    </template>

    <v-card>
      <v-card-title class="title grey lighten-2 py-2">
        <span>{{ title }}</span>
        <v-spacer></v-spacer>
        <v-icon v-if="!!icon">{{ icon }}</v-icon>
      </v-card-title>
      <ConfigFile
        :value.sync="editWordsFile"
        label="Words file config:"
        icon="mdi-folder"
      />
      <ConfigFile
        :value.sync="globalWordsFile"
        label="Global translation file:"
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
                v-model="allLocales"
                :items="[]"
                dense
                small-chips
                multiple
                cache-items
                deletable-chips
                hide-selected
                hint="Add/remove languages you want to be able to process"
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
                label="devLocale"
                hint="The language which you will work in to base the translations on"
                :items="allLocales"
                hide-details="auto"
                v-model="devLocale"
              ></v-select>
            </v-col>
            <v-col class="d-flex pl-2 pr-1 py-1" cols="12" sm="2">
              <v-switch
                dense
                v-model="all"
                class="ma-2"
                :label="all ? 'All remaining' : 'Select yourself'"
              ></v-switch>
            </v-col>
            <v-col class="d-flex pl-1 pr-3 py-1" cols="12" sm="8">
              <v-combobox
                dense
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
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col class="d-flex pl-2 pr-0 py-1" cols="12" sm="2">
              <v-switch
                dense
                :disabled="!yandexKey"
                v-model="useYandex"
                class="ma-2"
                label="Use Yandex first"
              ></v-switch>
            </v-col>
            <v-col class="d-flex pl-1 pr-3 py-1" cols="12" sm="10">
              <v-text-field
                class="caption"
                dense
                :type="passwd ? 'password' : 'text'"
                label="Yandex API key"
                append-icon="mdi-eye"
                title="The Yandex.Translate API key you will use for translation"
                :rules="[value => !!value || 'required']"
                hide-details="auto"
                v-model="yandexKey"
                @click:append="passwd = !passwd"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <v-card-actions class="pt-0 pb-1">
        <FjFileLoadButton
          text
          dense
          img="mdi-upload"
          label="Load Config File"
          tooltip="Load config from file"
          iconleft
          jsonparse
          stripuntil="{"
          @onchange="loaded"
          :opts="{ type: 'JSON', basename: 'config' }"
        />
        <FjFileSaveButton
          dense
          :disabled="!changed"
          text
          img="mdi-download"
          label="Save config file"
          iconleft
          :opts="{ type: 'JSON', basename: 'config' }"
          :content="newConf"
        />
        <v-spacer></v-spacer>
        <v-btn
          dense
          color="teal"
          text
          @click.stop="saveClose"
          :disabled="!changed"
        >
          <v-icon>mdi-check</v-icon>Save
        </v-btn>
        <v-btn dense color="primary" text @click.stop="show = false">
          <v-icon>mdi-cancel</v-icon>Close
        </v-btn>
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
      devLocale: "en",
      tempLocales: [],
      yandexKey: "",
      globalWordsFile: {},
      editWordsFile: {},
      useYandex: true,
      allLocales: [],
      all: true,
      passwd: true,
      show: false,
      origConf: ""
    };
  },
  components: { ConfigFile },
  props: {
    value: {
      type: Object,
      default: () => ({ empty: "No data cofigured!" }),
      required: true
    },
    title: {
      type: String,
      default: "",
      required: true
    },
    icon: {
      type: String,
      default: "",
      required: false
    }
    /*     yandex: {
      type: Object,
      default: () => null,
      required: true
    },
 */
  },
  computed: {
    locales: {
      get() {
        const loc = (this.all ? this.allLocales : this.tempLocales).filter(
          v => v !== this.devLocale
        );
        return loc;
      },
      set(value) {
        this.tempLocales = value;
      }
    },
    newConf() {
      const conf = {
        devLocale: this.devLocale,
        allLocales: this.allLocales,
        locales: this.locales,
        useYandex: this.useYandex,
        globalWordsFile: this.globalWordsFile,
        editWordsFile: this.editWordsFile,
        yandexKey: this.yandexKey.trim()
      };
      delete conf.globalWordsFile.name;
      delete conf.editWordsFile.name;
      return conf;
    },
    changed() {
      let ch =
        this.devLocale ||
        this.allLocales ||
        this.tempLocales ||
        this.useYandex ||
        this.globalWordsFile ||
        this.editWordsFile ||
        this.yandexKey;
      ch = JSON.stringify(this.newConf) != this.origConf;
      return ch;
    },
    allLocalesList() {
      return this.allLocales.filter(v => v !== this.devLocale);
    }
  },
  watch: {
    all(newi) {
      if (newi)
        this.locales = this.allLocales.filter(v => v !== this.devLocale);
    }
  },
  methods: {
    //    ...mapActions(["saveFile", "saveConfig"]),
    removeLang(what) {
      //      console.log("remove:", what);
      if (this.allLocales.indexOf(what >= 0))
        this.allLocales.splice(this.allLocales.indexOf(what >= 0), 1);
    },
    save() {
      const conf = this.newConf;
      this.$emit("input", conf);
      return conf;
    },
    loaded(e) {
      //      debugger;
      let {
        devLocale,
        allLocales,
        locales,
        yandexKey,
        useYandex,
        editWordsFile,
        globalWordsFile
      } = e;
      this.devLocale = devLocale || this.devLocale;
      this.allLocales = allLocales || this.allLocales;
      this.locales = locales || this.locales;
      this.yandexKey = yandexKey || this.yandexKey;
      this.globalWordsFile = globalWordsFile || this.globalWordsFile;
      this.editWordsFile = editWordsFile || this.editWordsFile;
      this.useYandex = useYandex || this.useYandex;
      //      console.log("loded config:", e);
    },
    saveClose() {
      this.save();
      this.show = false;
    },
    saveConfFile() {
      //      debugger;
      const conf = this.save();
      this.saveFile({
        name: "TranslateDictionaryConfig.json",
        value: conf
      });
    },
    loadConf() {
      const conf = this.value;
      this.devLocale = conf.devLocale;
      this.allLocales = conf.allLocales;
      this.tempLocales = conf.locales;
      this.yandexKey = conf.yandexKey;
      this.globalWordsFile = conf.globalWordsFile;
      this.editWordsFile = conf.editWordsFile;
      this.useYandex = conf.useYandex;
    }
  },
  created() {
    //    console.log("value:", this.value);
    /*     this.$store.watch(
      (state, getters) => state.config,
      (newV, oldV) => {
        //        console.log(newV, oldV);
        this.loadConf();
      }
    );
 */ this.loadConf();
  },
  mounted() {
    //    this.mapSetObject(this.globalWordsFile);
    //    this.mapSetObject(this.editWordsFile);
    this.origConf = this.newConf;
  }
};
</script>
