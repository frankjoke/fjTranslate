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
        <span>translate dictionary App Powered by Yandex.Translate</span>
        <FjB
          href="http://translate.yandex.com"
          target="_blank"
          img="mdi-open-in-new"
          tooltip="goto Yandex.Translate"
        />
        <span>and Google</span>
        <FjB
          href="https://translate.google.com/"
          target="_blank"
          img="mdi-open-in-new"
          tooltip="goto Translate.Google"
        />
      </div>

      <v-spacer></v-spacer>
      <FjAlerts :offsetX="-100" :offsetY="20" />
      <ConfigForm
        title="Configure settings:"
        icon="mdi-cog"
        v-model="config"
        text
        @click="showConfigForm = true"
        img="mdi-cog"
        label="edit settings"
        tooltip="Edit program settings..."
        :yandexapi="yandexKey"
        :filesys="fileSys"
      />
    </v-app-bar>

    <v-content class="ma-1">
      <v-container>
        <v-row no-gutters class="mb-1">
          <v-col cols="2">
            <FjFileLoadButton
              justify="center"
              iconleft
              img="mdi-folder-upload"
              label="load words"
              message="Words file"
              value="words.js"
              stripuntil="{"
              :opts="config.editWordsFile"
              @onchange="loadWords"
              x-small
            ></FjFileLoadButton>
          </v-col>
          <v-col cols="2">
            <FjFileSaveButton
              justify="center"
              iconleft
              x-small
              img="mdi-folder-download"
              label="save words"
              :opts="config.editWordsFile"
              :content="editContent"
              :disabled="!editContent || !changedWords"
              @shiftclick="doCopyClipboard($event.str)"
            />
          </v-col>
          <v-col cols="4">
            <!--             <v-text-field dense readonly :value="config.editWordsFile.name" solo flat class="ma-0 "></v-text-field>
            -->
            <div v-if="config.editWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem;" class="caption">
                Words Filename:
              </div>
              <div class="subtitle-2" style="line-height: 0.8rem;">
                {{ config.editWordsFile.name }}
              </div>
            </div>
          </v-col>
          <v-col cols="2">
            <FjB
              justify="center"
              iconleft
              x-small
              img="mdi-folder-multiple"
              label="Translate All"
              :disabled="!editContent || !Object.keys(editContent).length"
              @click.stop="
                $fjConfirm(
                  'okText=all,cancelText=missing,title=Translate:|(re)Translate all or only missing languages?'
                ).then((res) => translateAllKeys(res))
              "
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="mb-1">
          <v-col cols="2">
            <FjFileLoadButton
              justify="center"
              iconleft
              img="mdi-briefcase-upload"
              label="load global"
              message="Global file"
              :opts="config.globalWordsFile"
              @onchange="loadGlobal"
              x-small
            ></FjFileLoadButton>
          </v-col>
          <v-col cols="2">
            <FjFileSaveButton
              justify="center"
              iconleft
              img="mdi-briefcase-download"
              label="save global"
              :opts="config.globalWordsFile"
              :content="globalContent"
              :disabled="!globalContent || !changedGlobal"
              x-small
              @shiftclick="doCopyClipboard($event.str)"
            />
          </v-col>
          <v-col cols="4">
            <div v-if="config.globalWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem;" class="caption">
                Global Filename:
              </div>
              <div class="subtitle-2" style="line-height: 0.8rem;">
                {{ config.globalWordsFile.name }}
              </div>
            </div>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              class="my-0 py-0 caption"
              justify="center"
              v-model="globalOnly"
              dense
              hide-details
              label="Global only"
              :disabled="!globalContent"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-data-table
              :headers="editHeaders"
              :items="editKeys"
              single-expand
              :expanded.sync="editExpanded"
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
                    label="Search in keys"
                    single-line
                    hide-details
                    dense
                  ></v-text-field>
                  <v-dialog v-model="editedItem.show" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <FjB
                        text
                        color="primary darken-1"
                        v-on="on"
                        label="Add Key"
                        img="mdi-key-plus"
                        :disabled="!editContent"
                        small
                        class="mt-2"
                        @click="
                          Object.assign(editedItem, editedItem, {
                            name: '',
                            devText: '',
                            show: true,
                          })
                        "
                      />
                    </template>
                    <v-card>
                      <v-card-title
                        class="subtitle-1"
                        v-text="tt('Add a new Key for translation')"
                      />
                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-text-field
                              :autofocus="!editedItem.devText"
                              v-model="editedItem.name"
                              hint="No duplicates allowed!"
                              :rules="[rulesNoKeyDuplicates]"
                              hide-details="auto"
                              label="New Key"
                              @change="editedItem.devText = editedItem.name"
                            ></v-text-field>
                          </v-row>
                          <v-row>
                            <v-textarea
                              :autofocus="!!editedItem.devText"
                              :label="'Text in language `' + devLocale + '`'"
                              v-model="editedItem.devText"
                              :hint="'This text will be used as source text for translation to other languages!'"
                              clearable
                            ></v-textarea>
                          </v-row>
                        </v-container>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <FjB
                          color="primary darken-2"
                          text
                          iconleft
                          label="cancel"
                          img="mdi-cancel"
                          @click.stop="editedItem.show = false"
                        />
                        <FjB
                          color="success darken-2"
                          text
                          img="mdi-check"
                          right
                          label="Save"
                          :disabled="!editedItem.name"
                          @click="saveEditAdd"
                        />
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
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
                      label="Edit Key"
                      :rules="[rulesNoKeyDuplicates]"
                      flat
                      dense
                      hide-details="auto"
                      class="mt-3 py-2"
                      hint="No existing keys allowed!"
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
                  color="primary darken-1"
                  img="mdi-google-translate"
                  :tooltip="props.item.langs.join(',') + ', translate all?'"
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
                  <v-card class="ml-2 pa-1">
                    <v-data-table
                      :headers="langsHeaders"
                      :items="editExpandList"
                      item-key="lang"
                      dense
                    >
                      <template v-slot:top>
                        <v-system-bar window light color="grey lighten-2">
                          <div class="grey--text text--darken-4">
                            <span class="ml-2 body-2">{{
                              "Edit Languages for key:" | tt
                            }}</span>
                            <span class="ml-2 caption">{{
                              "'" + editExpand.key + "'"
                            }}</span>
                          </div>
                          <v-spacer></v-spacer>
                          <FjB
                            :disabled="
                              editExpand.langs.indexOf(devLocale) < 0 ||
                              editDialog.showTrans
                            "
                            :loading="editDialog.showTrans"
                            color="primary darken-1"
                            text
                            label="Re-translate all"
                            img="mdi-translate"
                            @click.stop="retranslateAll(null, true)"
                            small
                          ></FjB>
                          <FjB
                            :disabled="
                              editExpandList.length >= config.allLocales.length
                            "
                            color="primary darken-1"
                            text
                            small
                            label="Add Language"
                            img="mdi-map-marker-plus"
                            @click="addLanguage(editExpand.key)"
                          />
                          <v-dialog
                            v-model="editDialog.dialog"
                            max-width="800px"
                            @close="editDialogCancel"
                          >
                            <v-card>
                              <v-card-title>
                                <span class="headline">
                                  {{
                                    editDialog.createNew
                                      ? "New Language Item"
                                      : "Edit Language Item"
                                  }}
                                </span>
                              </v-card-title>

                              <v-card-text>
                                <v-container>
                                  <v-row>
                                    <v-col cols="4">
                                      <v-select
                                        :readonly="!editDialog.createNew"
                                        :xautofocus="editDialog.createNew"
                                        dense
                                        small-chips
                                        flat
                                        label="Language"
                                        :items="editDialog.allLangs"
                                        v-model="editDialog.lang"
                                      />
                                    </v-col>
                                    <v-col cols="8">
                                      <v-text-field
                                        readonly
                                        dense
                                        small
                                        flat
                                        label="For Key:"
                                        v-model="editExpand.key"
                                      />
                                    </v-col>
                                    <v-col cols="12">
                                      <v-textarea
                                        v-model="editDialog.translation"
                                        label="Translation"
                                        autofocus
                                        :xautofocus="!editDialog.createNew"
                                      ></v-textarea>
                                    </v-col>
                                  </v-row>
                                </v-container>
                              </v-card-text>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <FjB
                                  color="primary darken-1"
                                  text
                                  @click="editDialogCancel"
                                  label="Close"
                                  img="mdi-close"
                                />
                                <FjB
                                  color="success darken-1"
                                  :disabled="
                                    editDialog.lang === editDialog.olang &&
                                    editDialog.translation ===
                                      editDialog.otranslation
                                  "
                                  text
                                  @click="saveTranslation(editExpand.key)"
                                  label="Save"
                                  img="mdi-check"
                                />
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-system-bar>
                      </template>
                      <template v-slot:item.lang="{ item }">
                        <span
                          :class="
                            item.lang === devLocale ? 'subtitle-2' : 'caption'
                          "
                          >{{ item.lang }}</span
                        >
                      </template>
                      <template v-slot:item.translation="{ item }">
                        <textarea
                          class="caption"
                          :style="
                            'height: ' +
                            Math.ceil(
                              editContent[editExpand.key][item.lang].length /
                                100.0
                            ) *
                              20 +
                            'px'
                          "
                          :rows="
                            Math.ceil(
                              editContent[editExpand.key][item.lang].length /
                                100.0
                            )
                          "
                          v-model="editContent[editExpand.key][item.lang]"
                          style="width: 100%;"
                        ></textarea>
                        <!--                         <div
                          :class="
                            item.lang === devLocale ? 'subtitle-2' : 'caption'
                          "
                          @click="editDialogItem(item, true)"
                        >
                          {{ "'" + item.translation + "'" }}
                        </div>
                        -->
                      </template>
                      <template v-slot:item.action="{ item }">
                        <FjB
                          v-if="!item.wait"
                          small
                          icon
                          color="primary darken-1"
                          img="mdi-google-translate"
                          :tooltip="
                            item.lang === devLocale
                              ? 'Translate all?'
                              : 'translate `' + item.lang + '`'
                          "
                          @click="translateDialogItem(item)"
                        />
                        <v-progress-circular
                          v-else
                          :size="16"
                          color="primary darken-1"
                          :width="2"
                          indeterminate
                        ></v-progress-circular
                        >&nbsp;
                        <FjB
                          small
                          color="error darken-3"
                          img="mdi-delete"
                          @click="deleteDialogItem(item)"
                        />
                      </template>
                    </v-data-table>
                  </v-card>
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
      -->
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
        label="Save toAdd"
        :opts="{ type: 'JSON' }"
        :content="toAddDictionary()"
        small
        @shiftclick="doCopyClipboard($event.str)"
      />
      <!--       <span class="primary mx-1 lighten-4">primary</span>
      <span class="success lighten-4 mx-1">success</span>
      <span class="error lighten-4 mx-1">error</span>
      <span class="warning lighten-4 mx-1">warning</span>
      <span class="info lighten-4 mx-1">info</span>
      -->
      <div>
        <v-text-field v-model="textfile" />
        <FjB dense label="Test" @click="readTextFile(textfile)" />
      </div>
      <div>
        <v-textarea
          rows="10"
          cols="90"
          v-model="textarea"
          style="font-family: monospace; font-size: 12;"
          label="Text:"
        ></v-textarea>
      </div>
    </v-content>
    <FjConfirm />
  </v-app>
</template>

<script>
import Vue from "vue";
import helperMixin from "./plugins/helper";
import axios from "axios";
//import { setCORS } from "google-translate-api-browser";
// setting up cors-anywhere server address
//const gTranslate = setCORS("http://cors-anywhere.herokuapp.com/");

import YandexTranslator from "yandex-translator";
//import config from "@/assets/config.json";
//import global from "@/assets/global";
import FjConfirm from "./components/FjConfirm";

export default {
  name: "App",
  mixins: [helperMixin],
  components: { FjConfirm },
  data() {
    const that = this;
    return {
      textfile: "c:\\windows-version.txt",
      textarea: "result",
      fileSys: null,
      loaded: Date.now(),
      config: null,
      isElectron: process.env.IS_ELECTRON || false,
      devLocale: "en",
      globalOnly: false,
      editDialog: {
        dialog: false,
        wasGoogleError: false,
        lang: "",
        olang: "",
        translation: "",
        otranslation: "",
        createNew: false,
        showTrans: false,
      },
      //      time: new Date().toISOString(),
      editSearch: "",
      editedItem: {
        name: "",
        devText: "",
        show: false,
      },
      //      toAdd: this.toAddDictionary(),
      editExpanded: [],
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
      langsHeaders: [
        {
          text: "Language",
          //          align: "start",
          value: "lang",
          align: "center",
          sortable: false,
          width: "80",
        },
        {
          text: "Translation",
          value: "translation",
          align: "start",
          sortable: false,
          //          class: "caption"
          //          width: "80%"
          width: "100%",
        },
        {
          text: "Actions",
          value: "action",
          align: "end",
          sortable: false,
          //          class: "caption"
          width: "75",
        },
      ],
      //      wordContent: null,
      editCompare: JSON.stringify({}),
      globalCompare: "",
      globalContent: {},
      editContent: {},
      editWhat: null,
      yandex: {
        yandex: null,
        yandexLangs: [],
        yandexKey: process.env.VUE_APP_YANDEXKEY,
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
    editDialogCancel() {
      const ed = this.editDialog;
      ed.dialog = false;
      this.$nextTick().then((_) => {
        ed.lang = ed.olang = "";
        ed.translation = ed.translation = "";
        ed.createNew = true;
      });
    },

    saveTranslation(item) {
      const ed = this.editDialog;
      const ec = this.editContent;
      this.$set(ec[item], ed.lang, ed.translation);
      //          console.log("save call:", ed, item);
      this.editDialogCancel();
    },

    async addLanguage(key) {
      const ed = this.editDialog;
      const keys = Object.keys(this.editContent[key]);
      const list = this.config.allLocales.filter((i) => keys.indexOf(i) < 0);
      //          that.$alert(`info:${key}: ${list.join(",")}`);
      if (list.length) {
        ed.createNew = true;
        ed.allLangs = list;
        ed.lang = list[0];
        ed.dialog = true;
        await this.$nextTick();
        try {
          console.log("try to edit", key, ed);
          const res = await this.translate(key, ed.lang);
          if (res) return (this.editDialog.translation = res);
          else this.$alert({ type: "warning", tt: "No translation!" });
        } catch (e) {
          this.$alert({
            type: "error",
            text: this.tt("Error in translation: ${1}", e),
          });
        }
      } else
        this.$alert({
          type: "warning",
          text: this.tt("could not find language for '${1}'!", key),
        });
    },

    async retranslateAll(item, all) {
      const that = this;
      const key = (item && item.key) || that.editDialog.key;
      const stat = item ? item : that.editDialog;
      const curLangs = Object.keys(that.editContent[key]);
      const toLangs = that.config.allLocales.filter(
        (x) => x !== that.devLocale && (all || curLangs.indexOf(x) < 0)
      );
      that.$set(stat, "showTrans", true);
      return that
        .pAll(
          toLangs,
          (l) => that.translate(key, l).then((r) => ({ res: r, lang: l })),
          20
        )
        .then((res) => {
          for (var r of res)
            r.res && that.$set(that.editContent[key], r.lang, r.res);
        })
        .catch((e) =>
          that.$alert({
            type: "error",
            text: this.tt("Translation failure: ${1}", e),
          })
        )
        .then((_) => that.$set(stat, "showTrans", false))
        .then((_) => key);
    },

    translateAllKeys(all) {
      this.pSequence(
        this.editKeys,
        (key) => this.retranslateAll(key, all),
        100
      );
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

    deleteDialogItem(item) {
      const key = this.editExpand.key;
      const lang = item.lang;
      //      console.log("removelanguage:", lang, key);
      return this.$fjConfirm(
        `title=Delete language:, color=error darken-2, okColor=error darken-2|Do you really want to delete<br>
      '<strong>${lang}</strong>' from '<strong>${key}</strong>?`
      ).then((res) => res && this.$delete(this.editContent[key], lang));
    },

    translateDialogItem(item, index) {
      index = index || 0;
      const key = this.editExpand.key;
      const lang = item.lang;
      const devLang = this.devLocale;
      const devText = this.editContent[key][devLang];
      if (!devText || devText === key)
        this.$alert(
          `warning:Key = devLang: <br>'<strong>${key}</strong>'!<br>Please check!`
        );
      if (lang !== devLang) {
        item.wait = true;
        return this.wait().then((_) =>
          this.translate(key, lang)
            .then((res) => this.$set(this.editContent[key], lang, res))
            .catch((e) => this.$alert(`error: in translation: ${e}`))
            .then((_) => (item.wait = false))
            .then((_) => this.$nextTick())
        );
      } else {
        if (Object.keys(this.editContent[key]).length <= 1)
          return this.retranslateAll(item, true);
        return this.$fjConfirm(
          "okText=all,cancelColor=info,cancelText=missing,title=Translate:|Should all be translated or only missing languages?"
        ).then((res) => this.retranslateAll(item, res));
      }
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
      t = this.checkContent(t);
      this.editContent = t;
      this.wordCompare = JSON.stringify(t);
    },

    loadGlobal(t) {
      t = this.checkContent(t);
      this.globalContent = t;
      this.globalCompare = JSON.stringify(t);
    },

    getEditItem(n) {
      return JSON.stringify(this.editContent[n], null, 2);
    },

    saveKeyChange(item) {
      this.$set(this.editContent, item.name, item.trans);
      this.$delete(this.editContent, item.key);
    },

    saveEditAdd() {
      /*         if (this.editedIndex > -1) {
          Object.assign(this.desserts[this.editedIndex], this.editedItem)
        } else {
          this.desserts.push(this.editedItem)
        }

 */
      this.$set(this.editContent, this.editedItem.name, {
        [this.devLocale]: this.editedItem.name,
      });
      this.editedItem.show = false;
      this.editedItem.name = "";
    },

    translateKey(key, to) {
      return (
        this.globalContent &&
        key &&
        to &&
        this.globalContent[key] &&
        this.globalContent[key][to]
      );
    },

    async translate(key, to) {
      const that = this;
      const tk = that.translateKey(key, to);
      const l = that.devLocale;
      const dl = that.editContent[key][l];
      const gc = that.globalContent;
      const gck = gc && gc[key];
      const eck = that.editContent && that.editContent[key];
      // console.log("globalFile returned:", key, to, tk, dl);
      if (tk && gck && eck) {
        if (gck[l] === eck[l]) return tk;
      } else if (that.globalOnly) {
        that.$alert({
          type: "error",
          text:
            "globalOnly not possible: Global key language text for devLang different than in this file!",
        });
        return null;
      }

      if (gc) {
        if (!gck && eck[l]) gc[key] = { [l]: eck[l] };
        else if (!gck[l] && eck[l]) gck[l] = eck[l];
      }
      const res = await that.anyTranslate({
        text: dl,
        from: that.devLocale || "auto",
        to,
      });
      if (res && res.text) {
        const ret = res.text;
        if (ret && gc) {
          if (!gc[key]) that.$set(gc, key, { [l]: eck[l] || key });
          that.$set(gc[key], to, ret);
        }
        return ret;
      }
      return null;
    },

    async anyTranslate(opts_) {
      const that = this;

      async function gTrans() {
        if (that.editDialog.wasGoogleError) return null;
        try {
          const res = await translateGoogle(opts.text, opts);
          res.service = "google";
          //            console.log("Google returned ", res, " for ", opts.text);
          return res;
        } catch (e) {
          if (!that.editDialog.wasGoogleError)
            that.$alert({
              type: "warning",
              tt: "Google translation not available!",
            });
          that.editDialog.wasGoogleError = true;
          return null;
        }
      }

      async function translateGoogle(text, opts) {
        const cors = "https://cors-anywhere.herokuapp.com/";
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
          opts.from
        }&tl=${opts.to}&dt=t&q=${encodeURIComponent(text)}&ie=UTF-8&oe=UTF-8`;
        let response = null;
        try {
          try {
            response = await axios({ url, timeout: 15000 });
          } catch (e) {
            console.log(e.toSTring(), e);
            response = await axios({ url: cors + url, timeout: 15000 });
          }
          if (Array.isArray(response.data)) {
            // we got a valid response
            response.text = response.data[0][0][0];
            response.service = "google";
            return response;
          }
          throw new Error("Invalid response for translate request");
        } catch (e) {
          throw new Error(`Could not translate to "${targetLang}": ${e}`);
        }
      }

      async function yTrans() {
        const mopts = Object.assign({}, opts);
        if (mopts.to == "zh-cn") mopt.to = "zh";
        if (mopts.from == "zh-cn") mopt.from = "zh";
        try {
          let res = await that.yandex.yandex.translate(mopts);
          res = JSON.parse(res);
          res.service = "yandex";
          if (Array.isArray(res.text)) res.text = res.text.join("\n");
          //            console.log("Yandex returned ", res, " for ", opts.text);
          return res;
        } catch (e) {
          that.$alert({
            type: "warning",
            text: that.tt("Yandex translation error: ${1}", e),
          });
          return null;
        }
      }

      const opts = {
        from: opts_.from || "auto",
        to: opts_.to || "en",
        hl: opts_.hl || "en",
        raw: opts_.raw || false,
        tld: opts_.tld || "com",
        text: opts_.text || "no text supplied",
      };
      const yavailable =
        that.yandex.yandex &&
        that.yandex.yandexLangs.indexOf(opts.from) >= 0 &&
        that.yandex.yandexLangs.indexOf(opts.to) >= 0;
      if (opts.from === opts.to)
        return that.$alert("warning:Cannot translater from/to same languiage!");

      if (
        that.yandex.yandex &&
        (that.config.useYandex || that.editDialog.wasGoogleError)
      )
        return yTrans().catch((e) => gTrans().catch((e) => null));

      return gTrans().catch((e) => (yavailable ? yTrans() : null));
    },

    saveYandex() {
      if (!this.yandexKey) return Promise.resolve("Yandex key not available!");
      if (!this.yandex.yandex)
        this.yandex.yandex = new YandexTranslator(this.yandexKey);
      return this.yandex.yandex
        .getAvailableLanguages()
        .then((v) => {
          let dist = JSON.parse(v);
          if (dist && dist.dirs)
            dist = dist.dirs.filter((i) => i.split("-")[0] == this.devLocale);
          dist = dist.map((i) => i.split("-")[1]);
          if (dist.length > 0) dist.push(this.devLocale);
          this.yandexLangs = this.yandex.yandexLangs = dist;
        })
        .catch((e) => this.$alert(`error: ${e}`));
    },

    readTextFile(file) {
      let res = "";
      try {
        res = fs.readFileSync(this.textfile).toString();
      } catch (e) {
        res = `${e}`;
      }
      this.textarea = res;
    },
  },

  computed: {
    yandexKey() {
      return this.yandex.yandexKey || this.config.yandexKey;
    },
    changedGlobal() {
      return this.globalCompare != JSON.stringify(this.globalContent);
    },
    changedWords() {
      return this.editCompare != JSON.stringify(this.editContent);
    },
    editKeys() {
      const ec = this.editContent;

      return ec
        ? Object.keys(ec).map((k) => ({
            key: k,
            name: k,
            langs: Object.keys(ec[k]),
            trans: ec[k],
            devKey: ec[k][this.devLocale],
          }))
        : [];
    },

    editExpand() {
      return this.editExpanded.length ? this.editExpanded[0] : null;
    },
    editExpandList() {
      if (this.editExpand) {
        const trans = this.editExpand.trans;
        return Object.keys(trans).map((l) => ({
          lang: l,
          translation: trans[l],
          action: l == this.devLocale,
          wait: false,
        }));
      } else return [];
    },
  },
  watch: {
    yandexKey: function (newV) {
      this.saveYandex();
      //      console.log("watch yandexkey newV:", newV);
    },
    "config.devLocale": function (newV) {
      if (newV !== this.devLocale) {
        this.devLocale = newV;
        this.saveYandex();
      }
      //      console.log("watch devlocale newV:", newV);
    },
    devLocale(newV, oldV) {
      //      console.log("devLocale changed:", newV, oldV);
      if (this.config.locales.indexOf(this.toLang) < 0)
        this.toLang = this.config.locales[0];
      if (newV !== this.config.devLocale) this.config.devLocale = newV;
    },
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
  },
  mounted() {
    //    console.log(this.toAddDictionary);
    //    console.log(Vue.prototype.$dictionary, global);
    //    console.log(this.getTimeInterval(Date.now() - 100000));
    //    console.log(this.getTimeInterval(startup));
    //    this.toAdd = this.toAddDictionary();
    this.saveYandex();
    this.devLocale = this.config.devLocale;
    // if (global) {
    //   this.globalContent = global;
    //   this.globalOnly = true;
    // }
    this.$alert({
      text: this.tt(
        "Mylang = ${1} and ${2} and ${3}",
        this.myLang,
        this.$llang,
        this.$dictionary.mylang
      ),
    });
    //    console.log(this.$options)
    console.log(this.isElectron, this.$dictionary);
    this.textarea = this.inspect(process.env);
  },
  created() {
    this.config = require("./assets/config.json").translatedictionary;
    this.devLocale = this.config.devLocale;
    Vue.prototype.$llang = this.myLang;
    if (this.isElectron) this.fileSys = require("fs");
    else
      this.fileSys = {
        readFileSync: (x) => console.log("Error:", "Filesystem not available"),
      };
  },
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
