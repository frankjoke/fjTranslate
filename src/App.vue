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
            />
          </v-col>
          <v-col cols="2">
            <FjB
              justify="center"
              iconleft
              x-small
              img="mdi-folder-move"
              label="To clipboard"
              :disabled="!editContent"
              @click.stop="doCopyClipboard(editContent)"
            />
          </v-col>
          <v-col cols="4">
            <!--             <v-text-field dense readonly :value="config.editWordsFile.name" solo flat class="ma-0 "></v-text-field>
            -->
            <div v-if="config.editWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem" class="caption">Words Filename:</div>
              <div class="subtitle-2" style="line-height: 0.8rem">{{ config.editWordsFile.name }}</div>
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
              @click.stop="translateAllKeys"
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
            />
          </v-col>
          <v-col cols="2">
            <FjB
              justify="center"
              iconleft
              x-small
              img="mdi-briefcase"
              label="To clipboard"
              :disabled="!globalContent"
              @click.stop="doCopyClipboard(globalContent)"
            />
          </v-col>
          <v-col cols="4">
            <div v-if="config.globalWordsFile.name" align="top" justify="left">
              <div style="line-height: 0.6rem" class="caption">Global Filename:</div>
              <div class="subtitle-2" style="line-height: 0.8rem">{{ config.globalWordsFile.name }}</div>
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
              :search="editSearch"
              calculate-widths
            >
              <template v-slot:top>
                <v-system-bar window light class="pb-2">
                  <v-icon v-if="editKeys.length" left>mdi-folder-star</v-icon>
                  <span class="subtitle-2">Words Translation File</span>
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
                        @click="
                          Object.assign(editedItem, editedItem, {
                            name: '',
                            devText: '',
                            show: true
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
                              :hint="
                                'This text will be used as source text for translation to other languages!'
                              "
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
                  class="caption mt-1"
                  :style="
                    'height: ' +
                      Math.ceil(props.item.devKey.length / 60.0) * 20 +
                      'px'
                  "
                  :rows="Math.ceil(props.item.devKey.length / 60.0)"
                  v-model="props.item.devKey"
                  style="width:100%;"
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
                  @click.stop="editDialog.retranslateAll(props.item)"
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
                <td :colspan="headers.length" style="background-color: white;" class="pl-4 pr-0">
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
                            <span class="ml-2 body-2">{{ "Edit Languages for key:" | tt }}</span>
                            <span class="ml-2 caption">{{ "'" + editExpand.key + "'" }}</span>
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
                            @click.stop="editDialog.retranslateAll(null)"
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
                        </v-system-bar>
                      </template>
                      <template v-slot:item.lang="{ item }">
                        <span
                          :class="
                            item.lang === devLocale ? 'subtitle-2' : 'caption'
                          "
                        >{{ item.lang }}</span>
                      </template>
                      <template v-slot:item.translation="{ item }">
                        <textarea
                          class="caption mt-1"
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
                      <template v-slot:item.action="{ item }">
                        <FjB
                          v-if="!item.wait"
                          small
                          color="primary darken-1"
                          img="mdi-google-translate"
                          @click="translateDialogItem(item)"
                        />
                        <v-progress-circular
                          v-else
                          :size="16"
                          color="primary darken-1"
                          :width="2"
                          indeterminate
                        ></v-progress-circular>&nbsp;
                        <FjB
                          right
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
      <textarea rows="10" v-model="textfile" />
      <br />
      <FjB label="Copy!" @click="doCopyClipboard('textfile')" />
      <FjB label="Paste" v-sticky:ppp.aaa="'xxx'" @click="consoleLog(clipboardData())" />
      <!--       <span class="primary mx-1 lighten-4">primary</span>
      <span class="success lighten-4 mx-1">success</span>
      <span class="error lighten-4 mx-1">error</span>
      <span class="warning lighten-4 mx-1">warning</span>
      <span class="info lighten-4 mx-1">info</span>
      <div>
        <v-text-field v-model="textfile" />
        <FjB dense label="Test" @click="readTextFile(textfile)" />
      </div>
      <div>
        <textarea rows="10" v-model="textarea">Label</textarea>
      </div>
      -->
    </v-content>
    <FjConfirm />
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
      config: config,
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
              .then(_ =>
                that
                  .translate(key, ed.lang)
                  .then(res =>
                    res
                      ? (that.editDialog.translation = res)
                      : that.$alert("warning:No translation!")
                  )
              )
              .catch(e => that.$alert(`error: in translation: ${e}`));
          }
          that.$alert(`warning: could not find language for ${key}!`);
        },
        retranslateAll(item) {
          const key = (item && item.key) || that.editDialog.key;
          const stat = item ? item : that.editDialog;
          const toLangs = that.config.allLocales.filter(
            x => x !== that.devLocale
          );
          that.$set(stat, "showTrans", true);
          return (item && item.key
            ? Promise.resolve(true)
            : that.$fjConfirm(
                `Add/Renew::Do you really want to add/renew all languages for<br><strong>${key}</strong>from '<strong>${that.devLocale}</strong>'?`
              )
          )
            .then(
              res =>
                res &&
                Promise.all(
                  toLangs.map(l =>
                    that
                      .translate(key, l)
                      .then(r =>
                        that.$nextTick().then(_ => ({ res: r, lang: l }))
                      )
                  )
                )
                  .then(res => {
                    for (var r of res) {
                      //                      console.log(r);
                      if (r.res)
                        that.$set(that.editContent[key], r.lang, r.res);
                    }
                  })
                  .catch(e => that.$alert("error:Translation failure!"))
            )
            .then(_ => that.$set(stat, "showTrans", false))
            .then(_ => key);
        }
      },
      //      time: new Date().toISOString(),
      editSearch: "",
      editedItem: {
        name: "",
        devText: "",
        show: false
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
          width: "1%"
        },
        {
          get text() {
            return "Original text in '" + that.devLocale + "'";
          },
          align: "start",
          sortable: true,
          filterable: true,
          value: "devKey",
          width: "65%"
        },
        {
          text: "Actions",
          align: "end",
          value: "langs",
          sortable: false,
          filterable: true,
          width: 90
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
          width: "80"
        },
        {
          text: "Translation",
          value: "translation",
          align: "start",
          sortable: false,
          //          class: "caption"
          //          width: "80%"
          width: "100%"
        },
        {
          text: "Actions",
          value: "action",
          align: "end",
          sortable: false,
          //          class: "caption"
          width: "75"
        }
      ],
      //      wordContent: null,
      wordCompare: "",
      globalCompare: "",
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
    translateAllKeys() {
      this.pSequence(
        this.editKeys,
        key => this.editDialog.retranslateAll(key),
        100
      ).then(res => console.log(res));
      // const testPromise = key =>
      //   this.wait(1000).then(_ => this.$alert("info:Processing " + key));
      // keys.reduce((p, x) => p.then(_ => testPromise(x)), Promise.resolve());
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
        "Delete::Do you really want to delete<br>'<strong>" +
          props.item.key +
          "</strong>'?",
        { color: "error darken-2", okColor: "error darken-2" }
      ).then(res => res && this.$delete(this.editContent, props.item.key));
    },
    deleteDialogItem(item) {
      const key = this.editExpand.key;
      const lang = item.lang;
      //      console.log("removelanguage:", lang, key);
      return this.$fjConfirm(
        "Delete::Do you really want to delete<br>'<strong>" +
          lang +
          "</strong>' from '<strong>" +
          key +
          "</strong>?",
        { color: "error darken-2", okColor: "error darken-2" }
      ).then(res => res && this.$delete(this.editContent[key], lang));
    },
    translateDialogItem(item, index) {
      index = index || 0;
      const key = this.editExpand.key;
      const lang = item.lang;
      const devLang = this.devLocale;
      const devText = this.editContent[key][devLang];
      if (!devText || devText === key)
        this.$alert("Key = devLang text: '" + key + "'");
      if (lang !== devLang) {
        item.wait = true;
        return this.wait().then(_ =>
          this.translate(key, lang)
            .then(res => this.$set(this.editContent[key], lang, res))
            .catch(e => this.$alert(`error: in translation: ${e}`))
            .then(_ => (item.wait = false))
            .then(_ => this.$nextTick())
        );
      } else {
        return this.$fjConfirm("Translate: Should all be translated?").then(
          res => res && this.$alert("warning: Need to be implemented!")
        );
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
        [this.devLocale]: this.editedItem.name
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
    translate(key, to) {
      const tk = this.translateKey(key, to);
      if (this.globalOnly) return Promise.resolve(tk);
      const dl = this.editContent[key][this.devLocale];
      //      console.log("globalFile returned:", key, to, tk, dl);
      if (tk === dl) {
        //        console.log("globalFile returned:", tk, dl);
        return Promise.resolve(tk);
      } else if (this.globalContent)
        this.globalContent[key][this.devLocale] = this.editContent[key][
          this.devLocale
        ];
      return this.anyTranslate({
        text: dl,
        from: this.devLocale || "auto",
        to
      }).then(res => {
        if (res) res = res.text;
        if (res && this.globalContent) {
          let gc = this.globalContent;
          if (!gc[key]) {
            const dl = {
              [this.devLocale]: this.editContent[key][this.devLocale] || key
            };
            this.$set(gc, key, dl);
          }
          this.$set(gc[key], to, res);
        }
        return res;
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
            //            console.log("Google returned ", res, " for ", opts.text);
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
            //            console.log("Yandex returned ", res, " for ", opts.text);
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
      if (opts.from === opts.to)
        return this.$alert("warning:Cannot translater from/to same languiage!");

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
        .catch(e => this.$alert(`error: ${e}`));
    },
    readTextFile(file) {
      let res = "";
      try {
        res = fs.readFileSync(this.textfile).toString();
      } catch (e) {
        res = `${e}`;
      }
      this.textarea = res;
    }
  },
  computed: {
    changedGlobal() {
      return this.globalCompare != JSON.stringify(this.globalContent);
    },
    changedWords() {
      return this.editCompare != JSON.stringify(this.editContent);
    },
    editKeys() {
      const ec = this.editContent;

      return ec
        ? Object.keys(ec).map(k => ({
            key: k,
            name: k,
            langs: Object.keys(ec[k]),
            trans: ec[k],
            devKey: ec[k][this.devLocale]
          }))
        : [];
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
    "config.yandexKey": function(newV) {
      this.saveYandex();
      //      console.log("watch yandexkey newV:", newV);
    },
    "config.devLocale": function(newV) {
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
    }
  },
  mounted() {
    //    console.log(this.toAddDictionary);
    //    console.log(Vue.prototype.$dictionary);
    //    console.log(this.getTimeInterval(Date.now() - 100000));
    //    console.log(this.getTimeInterval(startup));
    //    this.toAdd = this.toAddDictionary();
    this.saveYandex(null);
    this.devLocale = this.config.devLocale;
  },
  created() {
    if (!fs || !fs.readFileSync)
      return (this.textarea = "Cannot run fs.readFileSync in browser!");
  }
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

const fs = require("fs");
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
</style>
