<template>
  <v-app>
    <v-app-bar fixed app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="webtranslate logo"
          class="shrink mr-2"
          contain
          src="@/assets/logo.png"
          transition="scale-transition"
          width="40"
        />
        <span>translateDictionary App Powered by Yandex.Translate</span>
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
          tooltip="goto Yandex.Translate"
        />
      </div>

      <v-spacer></v-spacer>
      <FjAlerts :offsetX="-100" :offsetY="20"></FjAlerts>
      <ConfigForm
        title="Configure settings:"
        icon="mdi-settings"
        v-model="config"
        text
        @click="showConfigForm = true"
        img="mdi-settings"
        label="edit settings"
        tooltip="Edit program settings..."
      />
    </v-app-bar>
    <!--     <ConfigForm :visible="showConfigForm" @close="showConfigForm = false">
    -->
    <v-content class="ma-1">
      <v-container>
        <v-row no-gutters class="mb-1">
          <v-col cols="2">
            <FjFileLoadButton
              justify="center"
              iconleft
              img="mdi-folder-upload"
              label="load words"
              value="words.js"
              stripuntil="{"
              :opts="config.editWordsFile"
              @onchange="loadWords"
              x-small
            ></FjFileLoadButton>
          </v-col>
          <v-col cols="2">
            <FjB
              justify="center"
              iconleft
              img="mdi-folder-star"
              label="edit words"
              :disabled="!wordContent || editContent === wordContent"
              x-small
              @click="editContent = wordContent"
            />
          </v-col>
          <v-col cols="2">
            <FjFileSaveButton
              justify="center"
              iconleft
              x-small
              img="mdi-folder-download"
              label="save words"
              :opts="config.editWordsFile"
              :content="wordContent"
              :disabled="!wordContent || !changedWords"
            />
          </v-col>
          <v-col cols="6">
            <!--             <v-text-field dense readonly :value="config.editWordsFile.name" solo flat class="ma-0 "></v-text-field>
            -->
            <div v-if="config.editWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem" class="caption">
                Words Filename:
              </div>
              <div class="subtitle-2" style="line-height: 0.8rem">
                {{ config.editWordsFile.name }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters class="mb-1">
          <v-col cols="2">
            <FjFileLoadButton
              justify="center"
              iconleft
              img="mdi-briefcase-upload"
              label="load global"
              :opts="config.globalWordsFile"
              @onchange="loadGlobal"
              x-small
            ></FjFileLoadButton>
          </v-col>
          <v-col cols="2">
            <FjB
              justify="center"
              iconleft
              img="mdi-briefcase-check"
              label="edit global"
              :disabled="!globalContent || editContent === globalContent"
              x-small
              @click="editContent = globalContent"
            />
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
            />
          </v-col>
          <v-col cols="6">
            <div v-if="config.globalWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem" class="caption">
                Global Filename:
              </div>
              <div class="subtitle-2" style="line-height: 0.8rem">
                {{ config.globalWordsFile.name }}
              </div>
            </div>
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
              :search="editSearch"
              calculate-widths
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>
                    <v-icon v-if="editKeys.length">
                      {{
                        editContent === wordContent
                          ? "mdi-folder-star"
                          : "mdi-briefcase-check"
                      }}
                    </v-icon>
                    <span class="subtitle-2">
                      {{
                        editContent === wordContent
                          ? "Words"
                          : editContent === globalContent
                          ? "Global"
                          : ""
                      }}
                      Translation File
                    </span>
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="editSearch"
                    append-icon="mdi-magnify"
                    label="Search in keys"
                    single-line
                    hide-details
                  ></v-text-field>
                  <v-dialog v-model="addDialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <FjB
                        text
                        color="primary darken-1"
                        v-on="on"
                        label="Add Key"
                        img="mdi-key-plus"
                        :disabled="!editKeys.length"
                      />
                    </template>
                    <v-card>
                      <v-card-title>
                        <span class="headline">Add new Key</span>
                      </v-card-title>

                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col cols="12" sm="6" md="4">
                              <v-text-field
                                autofocus
                                v-model="editedItem.name"
                                hint="No duplicates allowed!"
                                clearable
                                :rules="[rulesNoKeyDuplicates]"
                                hide-details="auto"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary darken-1"
                          text
                          @click="closeEditAdd"
                          >Cancel</v-btn
                        >
                        <v-btn
                          color="primary darken-1"
                          text
                          @click="saveEditAdd"
                          >Save</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              </template>
              <template v-slot:item.langs="props">
                <span class="caption">
                  {{ props.item.langs.join(",") }}
                  <FjB
                    img="mdi-delete"
                    small
                    color="error darken-3"
                    right
                    @click.stop="editRemoveKey(props)"
                  ></FjB>
                </span>
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
                      outlined
                      hide-details="auto"
                      class="mt-4"
                      hint="No existing keys allowed!"
                    ></v-text-field>
                  </template>
                  <template v-slot:input>
                    <v-text-field
                      v-model="props.item.name"
                      label="Edit Key"
                      :rules="[rulesNoKeyDuplicates]"
                      outlined
                      hide-details="auto"
                      class="mt-4"
                      hint="No existing keys allowed!"
                    ></v-text-field>
                  </template>
                </v-edit-dialog>
              </template>
              <template v-slot:expanded-item="{ headers }">
                <td :colspan="headers.length" style="background-color: white;">
                  <v-card class="ml-2 pa-1">
                    <v-data-table
                      :headers="langsHeaders"
                      :items="editExpandList"
                      item-key="lang"
                      dense
                    >
                      <template v-slot:top>
                        <v-toolbar
                          dense
                          flat
                          color="grey lighten-2"
                          style="height: 40px;"
                        >
                          <v-toolbar-title class="body-2">
                            {{ "Edit Languages for key:" | tt }}
                          </v-toolbar-title>
                          <span class="ml-2 caption">
                            {{ "'" + editExpand.key + "'" }}
                          </span>
                          <v-spacer></v-spacer>
                          <FjB
                            :disabled="editExpand.langs.indexOf(devLocale) < 0"
                            color="primary darken-1"
                            class="mb-2"
                            text
                            label="Re-translate all"
                            img="mdi-translate"
                            @click.stop="editDialog.retranslateAll(devLocale)"
                          ></FjB>
                          <FjB
                            :disabled="
                              editExpandList.length >= config.allLocales.length
                            "
                            color="primary darken-1"
                            text
                            class="mb-2"
                            small
                            label="Add Language"
                            img="mdi-map-marker-plus"
                            @click="editDialog.addLanguage(editExpand.key)"
                          />
                          <v-dialog
                            v-model="editDialog.dialog"
                            max-width="800px"
                            @close="editDialog.cancel"
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
                                  @click="editDialog.cancel"
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
                                  @click="
                                    editDialog.saveTranslation(editExpand.key)
                                  "
                                  label="Save"
                                  img="mdi-check"
                                />
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-toolbar>
                      </template>
                      <template v-slot:item.action="{ item }">
                        <FjB
                          v-if="!item.wait"
                          small
                          color="primary darken-1"
                          img="mdi-google-translate"
                          @click="translateDialogItem(item)"
                        />
                        <v-progress-circular
                          v-if="item.wait"
                          :size="16"
                          color="primary darken-1"
                          :width="2"
                          indeterminate
                        ></v-progress-circular>
                        <FjB
                          right
                          small
                          color="error darken-3"
                          img="mdi-delete"
                          @click="deleteDialogItem(item)"
                        />
                      </template>
                      <template v-slot:item.translation="{ item }">
                        <textarea
                          class="caption"
                          :rows="
                            Math.ceil(
                              editContent[editExpand.key][item.lang].length /
                                80.0
                            )
                          "
                          v-model="editContent[editExpand.key][item.lang]"
                          style="width:100%;"
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
                      <template v-slot:item.lang="{ item }">
                        <span
                          :class="
                            item.lang === devLocale ? 'subtitle-2' : 'caption'
                          "
                          >{{ item.lang }}</span
                        >
                      </template>
                    </v-data-table>
                  </v-card>
                </td>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
      {{ tiv }}
      <span class="primary mx-1 lighten-4">primary</span>
      <span class="success mx-1">success</span>
      <span class="error mx-1">error</span>
      <span class="warning mx-1">warning</span>
    </v-content>
  </v-app>
</template>

<script>
import Vue from "vue";
import helperMixin from "./plugins/helper";
import { setCORS } from "google-translate-api-browser";
// setting up cors-anywhere server address
const gTranslate = setCORS("http://cors-anywhere.herokuapp.com/");

import YandexTranslator from "yandex-translator";
import config from "@/assets/config";

export default {
  name: "App",
  mixins: [helperMixin],
  data() {
    const that = this;
    return {
      config: config,
      devLocale: "en",
      addDialog: false,
      editDialog: {
        dialog: false,
        wasGoogleError: false,
        lang: "",
        olang: "",
        translation: "",
        otranslation: "",
        createNew: false,
        testcall() {
          console.log("testcall:", that.editDialog);
          that.editDialog.cancel();
        },
        clear() {
          const ed = that.editDialog;
          ed.lang = ed.olang = "";
          ed.translation = ed.translation = "";
          ed.createNew = true;
        },
        cancel() {
          that.editDialog.dialog = false;
          that.$nextTick(that.editDialog.clear);
        },
        saveTranslation(item) {
          const ed = that.editDialog;
          const ec = that.editContent;
          that.$set(ec[item], ed.lang, ed.translation);
          //          console.log("save call:", ed, item);
          that.editDialog.cancel();
        },
        addLanguage(key) {
          const ed = that.editDialog;
          const keys = Object.keys(that.editContent[key]);
          const list = that.config.allLocales.filter(i => keys.indexOf(i) < 0);
          //          that.$alert(`info:${key}: ${list.join(",")}`);
          if (list.length) {
            ed.createNew = true;
            ed.allLangs = list;
            ed.lang = list[0];
            ed.dialog = true;
            return that
              .$nextTick()
              .then(() =>
                that
                  .translate(key, ed.lang)
                  .then(res => (that.editDialog.translation = res))
              )
              .catch(e => that.alert(`error: in translation: ${e}`));
          }
          that.alert(`warning: could not find language for ${key}!`);
        },
        retranslateAll(devLocale) {
          const ed = that.editDialog;
          const toLangs = that.config.allLocales.filter(
            x => x !== that.devLocale
          );
          const text = that.editContent[that.editExpand.key][that.devLocale];
          if (!text)
            return that.$alert(
              `error:Problem with key '${that.editExpand.key}' and language '${that.devLocale}'`
            );
          that.vConfirm(
            `Do you really want to add/renew all languages from '${that.devLocale}'?`,
            () =>
              Promise.all(
                toLangs.map(l =>
                  that.translate(text, l).then(r => ({ res: r, lang: l}))
                )
              ).then(res => {
                for (var r of res) {
                  console.log(r);
                  that.$set(
                    that.editContent[that.editExpand.key],
                    r.lang,
                    r.res
                  );
                }
              })
          );
        }
      },
      //      time: new Date().toISOString(),
      editSearch: "",
      editedItem: {
        name: ""
      },
      //      toAdd: this.toAddDictionary(),
      editExpanded: [],
      editHeaders: [
        {
          text: "Translation Key",
          align: "start",
          sortable: true,
          filterable: true,
          value: "name"
          //          width: "65%"
        },
        {
          text: "Languages",
          align: "end",
          value: "langs",
          sortable: false,
          filterable: true,
          width: 220
          //          class: "caption"
        }
      ],
      langsHeaders: [
        {
          text: "Language",
          //          align: "start",
          value: "lang",
          align: "center",
          sortable: false,
          width: "100"
        },
        {
          text: "Translation",
          value: "translation",
          align: "start",
          sortable: false
          //          class: "caption"
          //          width: "80%"
        },
        {
          text: "Actions",
          value: "action",
          align: "end",
          sortable: false,
          //          class: "caption"
          width: "80"
        }
      ],
      wordContent: null,
      wordCompare: "",
      globalCompare: "",
      tiv: "just now",
      globalContent: null,
      editContent: {},
      editWhat: null,
      yandex: {
        yandex: null,
        yandexLangs: []
      }
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
      console.log("removeKey:", props.item.key);
      this.vConfirm(
        "Do you really want to delete<br>'<strong>" +
          props.item.key +
          "</strong>'?",
        key => this.$delete(this.editContent, key),
        props.item.key
      );
    },
    deleteDialogItem(item) {
      const key = this.editExpand.key;
      const lang = item.lang;
      console.log("removelanguage:", lang, key);
      this.vConfirm(
        "Do you really want to delete<br>'<strong>" +
          lang +
          "</strong> from '<strong>" +
          key +
          "</strong>?",
        () => this.$delete(this.editContent[key], lang)
      );
    },
    translateDialogItem(item, index) {
      index = index || 0;
      const key = this.editExpand.key;
      const lang = item.lang;
      const devLang = this.devLocale;
      const devText = this.editContent[key][devLang];
      if (!devText)
        return this.alert(
          "Cannot translate empty Text without devLocale text available!"
        );
      if (lang !== devLang) {
        item.wait = true;
        return this.wait().then(() =>
          this.translate(devText, lang)
            .then(res => this.$set(this.editContent[key], lang, res))
            .catch(e => this.alert(`error: in translation: ${e}`))
            .then(() => (item.wait = false))
        );
      } else {
        return this.alert("warning: Need to be implemented!");
      }
    },
    editDialogSave() {
      console.log("save:", this.editDialog.lang, this.editDialog.translation);
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
      this.wordContent = t;
      this.wordCompare = JSON.stringify(t);
      if (
        !Object.keys(this.editContent).length &&
        Object.keys(this.wordContent).length
      )
        this.$nextTick(() => {
          this.editContent = this.wordContent;
        });
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
    closeEditAdd() {
      this.addDialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      }, 300);
    },
    saveEditAdd() {
      /*         if (this.editedIndex > -1) {
          Object.assign(this.desserts[this.editedIndex], this.editedItem)
        } else {
          this.desserts.push(this.editedItem)
        }

 */
      this.$set(this.editContent, this.editedItem.name, {
        [this.devLocale]: this.editedItem.name
      });
      this.addDialog = false;
      this.editedItem.name = "";
    },
    translateKey(key, to) {
      if (
        this.editContent !== this.wordContent &&
        this.globalContent &&
        this.globalContent[key] &&
        this.globalContent[key][to]
      )
        return Promise.resolve(this.globalContent[key][to]);
    },
    translate(text, to, from) {
      from = from || this.devLocale || "auto";
      return this.anyTranslate({ text, from, to }).then(res => {
        return res ? res.text : "";
      });
    },
    anyTranslate(opts_) {
      const that = this;
      function gTrans() {
        if (that.editDialog.wasGoogleError)
          return Promise.reject("Google translation not available!");
        return gTranslate(opts.text, opts)
          .then(res => {
            res.service = "google";
            console.log("Google returned ", res, " for ", opts.text);
            return res;
          })
          .catch(e => {
            if (!that.editDialog.wasGoogleError)
              this.$alert("warning:Google translation not available!");
            that.editDialog.wasGoogleError = true;
            return null;
          });
      }
      function yTrans() {
        return that.yandex.yandex
          .translate(opts)
          .then(res => JSON.parse(res))
          .then(res => {
            res.service = "yandex";
            if (Array.isArray(res.text)) res.text = res.text.join("\n");
            console.log("Yandex returned ", res, " for ", opts.text);
            return res;
          })
          .catch(e => {
            this.$alert(`warning:Yandex translation error ${e}!`);
            return null;
          });
      }

      const opts = {
        from: opts_.from || "auto",
        to: opts_.to || "en",
        hl: opts_.hl || "en",
        raw: opts_.raw || false,
        tld: opts_.tld || "com",
        text: opts_.text || "no text supplied"
      };
      const yavailable =
        this.yandex.yandex &&
        this.yandex.yandexLangs.indexOf(opts.from) >= 0 &&
        this.yandex.yandexLangs.indexOf(opts.to) >= 0;

      return this.yandex.yandex && this.config.useYandex
        ? yTrans().catch(e => gTrans())
        : gTrans().catch(e => (yavailable ? yTrans() : opts.text));
    },
    saveYandex() {
      if (!this.config.yandexKey)
        return Promise.resolve("Yandex key not available!");
      if (!this.yandex.yandex)
        this.yandex.yandex = new YandexTranslator(this.config.yandexKey);
      return this.yandex.yandex
        .getAvailableLanguages()
        .then(v => {
          let dist = JSON.parse(v);
          if (dist && dist.dirs)
            dist = dist.dirs.filter(i => i.split("-")[0] == this.devLocale);
          dist = dist.map(i => i.split("-")[1]);
          if (dist.length > 0) dist.push(this.devLocale);
          this.yandexLangs = this.yandex.yandexLangs = dist;
        })
        .catch(e => this.alert(`error: ${e}`));
    }
  },
  computed: {
    changedGlobal() {
      return this.globalCompare != JSON.stringify(this.globalContent);
    },
    changedWords() {
      return this.wordCompare != JSON.stringify(this.wordContent);
    },
    editKeys() {
      const ec = this.editContent;
      return Object.keys(ec).map(k => ({
        key: k,
        name: k,
        langs: Object.keys(this.editContent[k]),
        trans: this.editContent[k]
      }));
    },
    editExpand() {
      return this.editExpanded.length ? this.editExpanded[0] : null;
    },
    editExpandList() {
      if (this.editExpand) {
        const trans = this.editExpand.trans;
        return Object.keys(trans).map(l => ({
          lang: l,
          translation: trans[l],
          action: l == this.devLocale,
          wait: false
        }));
      } else return [];
    }
  },
  watch: {
    config(newV, oldV) {
      if (
        newV.yandexKey !== oldV.yandexKey ||
        newV.devLocale !== oldV.devLocale
      ) {
        if (newV.devLocale !== oldV.devLocale)
          this.devLocale = this.newV.devLocale;
        this.saveYandex();
      }
      //      console.log("watch newC:", newC);
    },
    devLocale(newV, oldV) {
      console.log("devLocale changed:", newV, oldV);
      if (this.config.locales.indexOf(this.toLang) < 0)
        this.toLang = this.config.locales[0];
      if (newV.devLocale !== this.config.devLocale)
        this.config.devLocale = newV.devLocale;
    }
  },
  mounted() {
    //    console.log(this.toAddDictionary);
    //    console.log(Vue.prototype.$dictionary);
    console.log(this.getTimeInterval(Date.now() - 100000));
    //    this.toAdd = this.toAddDictionary();
    this.saveYandex(null);
  },
  created() {
    timerTiv = setInterval(() => {
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
};
let timerTiv = null;
let startup = Date.now();
</script>
<style>
html {
  overflow-y: auto !important;
}
.v-card__subtitle,
.v-card__text,
.v-card__title,
.container {
  padding: 8px;
}
td.text-start {
  padding-left: 5px;
  padding-right: 5px;
}
</style>
