<template>
  <v-app>
    <v-app-bar fixed app color="primary" dark class="py-0 my-0">
      <div class="d-flex align-center">
        <v-img
          alt="webtranslate logo"
          class="shrink mr-2"
          contain
          src="@/assets/logo.png"
          transition="scale-transition"
          width="40"
        />
        <span
          >fjTranslate App (v{{ version }}) Powered by Yandex.Translate</span
        >
        <FjB
          href="http://translate.yandex.com"
          target="_blank"
          img="mdi-open-in-new"
          :tooltip="$t('open webpage of {0}', 'Yandex.Translate')"
        />
        <span>and Google</span>
        <FjB
          href="https://translate.google.com/"
          target="_blank"
          img="mdi-open-in-new"
          :tooltip="$t('open webpage of {0}', 'Translate.Google')"
        />
      </div>

      <v-spacer></v-spacer>
      <FjAlerts :offsetX="-100" :offsetY="20" />
      <ConfigForm
        :title="$t('Configure settings:')"
        icon="mdi-cog"
        text
        img="mdi-cog"
        :label="$t('edit settings')"
        :tooltip="$t('Edit program settings...')"
      />
    </v-app-bar>

    <v-content class="ma-1">
      <v-container>
        <v-row no-gutters class="mb-1">
          <v-col cols="3">
            <FjFileLoadButton
              justify="center"
              iconleft
              img="mdi-folder-upload"
              :label="$t('load words')"
              @onchange="
                loadTextFromFile(
                  '',
                  config.editWordsFile,
                  $t('load Words file:')
                ).then((x) => loadWords(x))
              "
              :droplabel="$t('Drop words file here')"
              :tooltip="$t('open file selector for words file or drop it here')"
              small
            ></FjFileLoadButton>
          </v-col>
          <v-col cols="3">
            <FjB
              justify="center"
              iconleft
              small
              img="mdi-folder-download"
              :label="$t('save words')"
              :disabled="!editContent || !changedWords"
              @click.stop="saveFile(editContent, config.editWordsFile, $event)"
              :tooltip="
                $t(
                  'Save words file, with shift to clipboard, with alt select other location'
                )
              "
            />
          </v-col>
          <v-col cols="6">
            <!--             <v-text-field dense readonly :value="config.editWordsFile.name" solo flat class="ma-0 "></v-text-field>
            -->
            <div v-if="config.editWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem;" class="caption">
                {{ $t("Words Filename:") }}
              </div>
              <div class="body-2" style="line-height: 0.8rem;">
                {{ config.editWordsFile.name }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters class="mb-1">
          <v-col cols="3">
            <FjFileLoadButton
              justify="center"
              iconleft
              img="mdi-briefcase-upload"
              :label="$t('load global')"
              @onchange="
                (path) =>
                  loadTextFromFile(
                    path,
                    config.globalWordsFile,
                    $t('load Global file:')
                  ).then((x) => loadGlobal(x))
              "
              :droplabel="$t('Drop global file here')"
              :tooltip="
                $t('open file selector for global file or drop it here')
              "
              small
            ></FjFileLoadButton>
          </v-col>
          <v-col cols="3">
            <FjB
              justify="center"
              iconleft
              img="mdi-briefcase-download"
              :label="$t('save global')"
              :disabled="!globalContent || !changedGlobal"
              small
              @click.stop="
                saveFile(globalContent, config.globalWordsFile, $event)
              "
              :tooltip="
                $t(
                  'Save global file, with shift to clipboard, with alt select other location'
                )
              "
            />
          </v-col>
          <v-col cols="6">
            <div v-if="config.globalWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem;" class="caption">
                Global Filename:
              </div>
              <div class="subtitle-2" style="line-height: 0.8rem;">
                {{ config.globalWordsFile.name }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters class="mb-1">
          <v-col cols="3">
            <FjB
              v-if="!inTranslateAll"
              justify="center"
              iconleft
              small
              img="mdi-folder-multiple"
              :label="$t('Translate All')"
              :disabled="!editContent || !Object.keys(editContent).length"
              @click.stop="handleTranslateAll"
            />
            <v-progress-circular
              v-else
              :size="16"
              color="primary darken-1"
              :width="2"
              indeterminate
              class="mr-2"
            ></v-progress-circular>
          </v-col>
          <v-col cols="3">
            <v-checkbox
              class="my-0 py-0 caption"
              justify="center"
              v-model="globalOnly"
              dense
              hide-details
              :label="$t('Global only')"
              :disabled="!isGlobalContent || noGlobal"
            />
          </v-col>
          <v-col cols="3">
            <v-checkbox
              class="my-0 py-0 caption"
              justify="center"
              v-model="noGlobal"
              dense
              hide-details
              :label="$t('External only')"
              :disabled="globalOnly"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-data-table
              :headers="editHeaders"
              :items="editKeys"
              single-expand
              :expanded.sync="editExpandedSync"
              item-key="key"
              show-expand
              class="elevation-2"
              dense
              :items-per-page="15"
              :search="editSearch"
              calculate-widths
              :footer-props="{ showFirstLastPage: true }"
            >
              <template v-slot:top>
                <v-system-bar window light class="pb-2">
                  <v-icon v-if="editKeys.length" left>mdi-folder-star</v-icon>
                  <span class="subtitle-2 mt-2">Words Translation File</span>
                  <v-spacer></v-spacer>
                  <v-text-field
                    class="body-2"
                    v-model="editSearch"
                    append-icon="mdi-magnify"
                    :label="$t('Search in keys')"
                    single-line
                    hide-details
                    dense
                  ></v-text-field>
                  <EditItemDialog
                    :editedItem="editedItem"
                    :editContent="editContent"
                    :devLocale="devLocale"
                  ></EditItemDialog>
                </v-system-bar>
              </template>
              <template v-slot:item.name="props">
                <v-edit-dialog
                  :return-value.sync="props.item.name"
                  @save="saveKeyChange(props.item)"
                >
                  <span class="body-2">{{ "'" + props.item.name + "'" }}</span>
                  <template v-slot:input>
                    <v-text-field
                      v-model="props.item.name"
                      :label="$t('Edit Key')"
                      :rules="[rulesNoKeyDuplicates]"
                      flat
                      dense
                      hide-details="auto"
                      class="mt-3 py-2"
                      :hint="$t('No existing keys allowed!')"
                    ></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>
              <template v-slot:item.devKey="props">
                <textarea
                  class="caption"
                  :style="
                    'height: ' +
                    Math.ceil(props.item.devKey.length / 80.0) * 20 +
                    'px'
                  "
                  :rows="Math.ceil(props.item.devKey.length / 80.0)"
                  v-model="props.item.devKey"
                  style="width: 100%;"
                  @change="
                    $set(
                      editContent[props.item.key],
                      devLocale,
                      props.item.devKey
                    )
                  "
                ></textarea>
              </template>
              <template v-slot:item.langs="props">
                <FjB
                  v-if="!props.item.showTrans"
                  small
                  icon
                  :color="
                    !props.item.notAll
                      ? 'success darken-3'
                      : props.item.langs.length <= 1
                      ? 'error darken-3'
                      : 'primary darken-1'
                  "
                  img="mdi-google-translate"
                  :tooltip="
                    props.item.langs.join(',') + ': ' + $t('translate all?')
                  "
                  @click.stop="retranslateAll(props.item, true)"
                />
                <v-progress-circular
                  v-else
                  :size="16"
                  color="primary darken-1"
                  :width="2"
                  indeterminate
                  class="mr-2"
                ></v-progress-circular>
                <FjB
                  img="mdi-delete"
                  small
                  color="error darken-3"
                  @click.stop="editRemoveKey(props)"
                ></FjB>
              </template>
              <template v-slot:expanded-item="{ headers }">
                <td
                  :colspan="headers.length"
                  style="background-color: white;"
                  class="pl-4 pr-0"
                >
                  <KeyExpandDialog></KeyExpandDialog>
                </td>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
      <!--       <textarea rows="10" v-model="textfile" />
      <br />
      <FjB label="Copy!" @click="doCopyClipboard('textfile')" />
      <FjB label="Paste" v-sticky:ppp.aaa="'xxx'" @click="consoleLog(clipboardData())" />
      <FjB
        label="Test Alerts"
        small
        @click="
          $alert({
            type: random(['warning', 'error', 'info', 'success', 'primary']),
            tt: 'This will be the text displayed!',
          })
        "
      />
      
      <FjFileSaveButton
        iconleft
        img="mdi-translate"
        :label="$t('Save toAdd')"
        :opts="{ type: 'JSON' }"
        :content="toAddDictionary()"
        small
        @shiftclick="doCopyClipboard($event.str)"
      />
             <span class="primary mx-1 lighten-4">primary</span>
      <span class="success lighten-4 mx-1">success</span>
      <span class="error lighten-4 mx-1">error</span>
      <span class="warning lighten-4 mx-1">warning</span>
      <span class="info lighten-4 mx-1">info</span>
      <div>
        <v-textarea
          rows="10"
          cols="90"
          v-model="textarea"
          style="font-family: monospace; font-size: 12;"
          :label="$t('Text:')"
        ></v-textarea>
      </div>
      -->
    </v-content>
    <FjConfirm />
  </v-app>
</template>

<script>
import Vue from "vue";
import helperMixin from "./plugins/helper";
import EditItemDialog from "./components/EditItemDialog";
import KeyExpandDialog from "./components/KeyExpandDialog";

export default {
  name: "App",
  mixins: [helperMixin],
  components: { EditItemDialog, KeyExpandDialog },
  data() {
    const that = this;
    return {
      inTranslateAll: false,
      editWhat: null,
      //      time: new Date().toISOString(),
      editSearch: "",
      editExpandedSync: [],
      editHeaders: [
        {
          text: "Translation Key",
          align: "start",
          sortable: true,
          filterable: true,
          value: "name",
          width: "30%",
        },
        {
          get text() {
            return "Original text in '" + that.devLocale + "'";
          },
          align: "start",
          sortable: true,
          filterable: true,
          value: "devKey",
          width: "70%",
        },
        {
          text: "Actions",
          align: "end",
          value: "langs",
          sortable: false,
          filterable: true,
          width: 75,
          //          class: "caption"
        },
      ],
      editedItem: {
        name: "",
        devText: "",
        show: false,
      },
    };
  },
  methods: {
    /*     testAlert(options, options2) {
      if (options instanceof Event) options = options2;

      options = options2 || {
        type: this.random(["error", "warning", "info", "success"]),
        text: "Was an Error!",
        label: "Ok",
        timeout: Math.floor(this.random(2, 11))
      };
      console.log("Test Alert", options);
      this.$alert(options);
    },
 */
    async handleTranslateAll(event) {
      const that = this;
      that.inTranslateAll = true;
      await that.wait(10);
      if (event.altKey && event.shiftKey) {
        that.doCopyClipboard(that.myStringify(that.$missing, true));
        that.inTranslateAll = false;
        return that.$alert(that.$t("Missing words saved to clipboard!"));
      }
      const q = await that.$fjConfirm(
        `okText=all,cancelText=missing,title=${that.$t("Translate")}:|${that.$t(
          "(re)Translate all or only missing languages?"
        )}`
      );
      await that.translateAllKeys(q);
      that.inTranslateAll = false;
    },

    editDialogItem(item, edit) {
      const ed = this.editDialog;
      this.$set(ed, "lang", item.lang || this.devLocale);
      ed.lang = ed.olang = item.lang || this.devLocale;
      ed.key = this.editExpand.key;
      ed.translation = ed.otranslation =
        item.translation || this.editExpand.key;
      ed.createNew = !edit;
      ed.dialog = true;
    },

    editRemoveKey(props) {
      //      console.log("removeKey:", props.item.key);
      return this.$fjConfirm(
        `title=Delete key:, color=error darken-2, okColor=error darken-2|Do you really want to delete<br>
        '<strong>${props.item.key}</strong>'?`
      ).then((res) => res && this.$delete(this.editContent, props.item.key));
    },

    rulesNoKeyDuplicates(value) {
      return !value || !this.editContent[value] || "Key exist already!";
    },

    checkContent(c) {
      if (!c || typeof c !== "object") return {};
      for (var key in c) {
        if (!Object.keys(c[key]).length) c[key][this.devLocale] = key;
      }
      return c;
    },

    loadWords(t) {
      if (typeof t !== "object") return;
      // console.log("loadWords:", t);
      t = this.checkContent(t);
      this.editContent = t;
    },

    loadGlobal(t) {
      if (typeof t !== "object") return;
      // console.log("loadGlobal:", t);
      t = this.checkContent(t);
      this.globalContent = t;
    },

    getEditItem(n) {
      return JSON.stringify(this.editContent[n], null, 2);
    },

    saveKeyChange(item) {
      this.$set(this.editContent, item.name, item.trans);
      this.$delete(this.editContent, item.key);
    },
  },

  computed: {
    editKeys() {
      const ec = this.editContent;
      const dl = this.devLocale;
      const res = [];
      if (ec)
        for (const entry of Object.entries(ec)) {
          const [key, value] = entry;
          //          console.log(dl, key, value);
          const li = {
            key,
            name: key,
            langs: value ? Object.keys(value) : [],
            trans: value,
            devKey: value[dl] ? value[dl] : "",
          };
          li.notAll = li.langs.length < this.config.allLocales.length;
          res.push(li);
        }
      return res;
    },
  },

  watch: {
    editExpand(newV) {
      if (newV) {
        const { key, devKey } = newV;
        this.$set(this.editDialog, "key", key);
        this.$set(this.editDialog, "devKey", devKey);
      } else {
        this.$set(this.editDialog, "key", "");
        this.$set(this.editDialog, "devKey", "");
      }
    },

    editExpandedSync(newV) {
      // console.log("editExpandSync = ", this.editExpandedSync);
      //      await this.$nextTick();
      this.$set(
        this.$store.state,
        "editExpand",
        newV.length ? newV[0] : { langs: [], trans: null }
      );
      // console.log(this.editExpand);
    },
  },

  async mounted() {
    const that = this;
    //    console.log(this.toAddDictionary);
    //    console.log(Vue.prototype.$dictionary, global);
    //    console.log(this.getTimeInterval(Date.now() - 100000));
    //    console.log(this.getTimeInterval(startup));
    //    this.toAdd = this.toAddDictionary();
    const path = await that.$electron.realPath("./");
    const dir = await that.$electron
      .readDir("./")
      .catch(
        (e) => (
          that.$alert(
            "error:" + thios.$t("could not read directory ./! ") + e.toString()
          ),
          []
        )
      );
    // that.textarea = that.inspect(path) + "\n" + that.inspect(dir);
    let nc = {};
    const cfname = that.envConfig ? that.envConfig : "./config.json";
    try {
      let conf = await that.$electron.readFile(cfname, "utf8");
      conf = JSON.parse(conf);
      if (conf.fjTranslate) nc = conf.fjTranslate;
    } catch (e) {
      bc = require("./assets/config.json").fjTranslate;
      // no config loaded...
    } finally {
      that.$set(that.$store.state, "config", nc);
      //      that.config = nc;
      await that.wait(10);
      that.$forceUpdate();
    }
    await that.saveYandex();
    // if (global) {
    //   this.globalContent = global;
    //   this.globalOnly = true;
    // }
    // console.log(that.config);
    that.$alert({
      text: that.$t("Mylang = {0}", that.myLang),
    });
    //    console.log(this.$options)

    if (that.config.globalWordsFile.autoload) {
      const gf = that.config.globalWordsFile;
      await that.wait(50);
      try {
        let file = await that.readFileWindows(gf.fileName, "utf8");
        file = that.importFile(file, gf);
        that.loadGlobal(file);
        await that.wait(50);
        that.$forceUpdate();
      } catch (e) {
        that.$alert("error:when loading Words file:" + e.toString());
      }
    }
    if (that.config.editWordsFile.autoload) {
      const ef = that.config.editWordsFile;
      await that.wait(50);
      try {
        let file = await that.readFileWindows(ef.fileName, "utf8");
        file = that.importFile(file, ef);
        that.loadWords(file);
        await that.wait(50);
        that.$forceUpdate();
      } catch (e) {
        that.$alert("error:when loading Words file:" + e.toString());
      }
    }
  },

  /*   async beforeMount() {
    const that = this;
    const path = await that.$electron.realPath("./");
    const dir = await that.$electron
      .readDir("./")
      .catch(
        (e) => (
          that.$alert(
            "error:" + thios.$t("could not read directory ./! ") + e.toString()
          ),
          []
        )
      );
    // that.textarea = that.inspect(path) + "\n" + that.inspect(dir);
    let nc = {};
    try {
      let conf = await that.$electron.readFile("./config.json", "utf8");
      conf = JSON.parse(conf);
      if (conf.fjTranslate) nc = conf.fjTranslate;
    } catch (e) {
      bc = require("./assets/config.json").fjTranslate;
      // no config loaded...
    } finally {
      //      that.$set(that.$store.state, "config", nc);
      that.config = nc;
      //      that.config = nc;
      await that.wait(10);
      that.$forceUpdate();
    }
  },
 */
  /*   created() {
    timerTiv = setInterval(_ => {
      //       debugger;
      this.tiv = this.getTimeInterval(startup);
    }, 5000);
  },
  destroyed() {
    if (timerTiv) {
      clearInterval(timerTiv);
      timerTiv = null;
    }
  }
 */
};
/* let timerTiv = null;
let startup = Date.now();
 */
</script>
<style>
html {
  overflow-y: auto !important;
}
</style>
<style scoped>
::v-deep .v-card__subtitle,
::v-deep .v-card__title,
::v-deep .v-card__text,
::v-deep .container {
  padding: 6px;
}

::v-deep tbody tr:nth-of-type(even) {
  background-color: #e3f2fd;
}

::v-deep tbody tr:nth-of-type(odd) {
  background-color: #fefefe;
}

.xv-data-table-header {
  background-color: rgba(182, 183, 187);
  color: white;
}

.xv-data-footer {
  background-color: rgb(250, 250, 250);
}

.xtheme--light.v-data-table thead tr th {
  color: white;
}
::v-deep .v-data-table td,
::v-deep .v-data-table th {
  padding: 0 4px;
  border-left: 1px dotted #dddddd;
}
</style>
