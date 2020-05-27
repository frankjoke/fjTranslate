<template>
  <v-card class="ml-2 pa-1">
    <v-data-table
      :headers="langsHeaders"
      :items="editExpandList"
      item-key="lang"
      :items-per-page="-1"
      dense
      hide-default-footer
    >
      <template v-slot:top>
        <v-system-bar light color="grey lighten-2">
          <div class="grey--text text--darken-4">
            <span class="ml-2 body-2" v-t="'Key:'"></span>
            <span class="ml-2 caption">{{ "'" + editExpand.key + "'" }}</span>
          </div>
          <v-spacer></v-spacer>
          <FjB
            :disabled="
              editExpand.langs.indexOf(devLocale) < 0 || editDialog.showTrans
            "
            :loading="editDialog.showTrans"
            color="primary darken-1"
            text
            :label="$t('Re-translate all')"
            img="mdi-translate"
            @click.stop="retranslateAll(null, true)"
            small
          ></FjB>
          <FjB
            :disabled="editExpandList.length >= config.allLocales.length"
            color="primary darken-1"
            text
            small
            :label="$t('Add Language')"
            img="mdi-map-marker-plus"
            @click="addLanguage(editExpand.key)"
          />
          <v-dialog
            v-model="editDialog.dialog"
            max-width="95%"
            @close="editDialogCancel"
          >
            <v-card>
              <v-card-title>
                <span class="headline">
                  {{
                    editDialog.createNew
                      ? $t("New Language Item")
                      : $t("Edit Language Item")
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
                        :label="$t('Language')"
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
                        :label="$t('For Key:')"
                        v-model="editExpand.key"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="editDialog.translation"
                        :label="$t('Translation')"
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
                  :label="$t('Close')"
                  img="mdi-close"
                />
                <FjB
                  color="success darken-1"
                  :disabled="
                    editDialog.lang === editDialog.olang &&
                    editDialog.translation === editDialog.otranslation
                  "
                  text
                  @click="saveTranslation(editExpand.key)"
                  :label="$t('Save')"
                  img="mdi-check"
                />
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-system-bar>
      </template>
      <template v-slot:item.lang="{ item }">
        <span :class="item.lang === devLocale ? 'subtitle-2' : 'caption'">
          {{ item.lang }}
        </span>
      </template>
      <template v-slot:item.translation="{ item }">
        <textarea
          class="caption"
          :style="
            'height: ' +
            Math.ceil(editContent[editExpand.key][item.lang].length / 100.0) *
              20 +
            'px'
          "
          :rows="
            Math.ceil(editContent[editExpand.key][item.lang].length / 100.0)
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
</template>

<script>
import helperMixin from "../plugins/helper";

export default {
  name: "KeyExpandDialog",
  mixins: [helperMixin],

  props: {
    // title: {
    //   type: String,
    //   default: "",
    //   required: false,
    // },
    // icon: {
    //   type: String,
    //   default: "",
    //   required: false,
    // },
  },
  computed: {
    langsHeaders() {
      return [
        {
          text: this.$t("Language"),
          //          align: "start",
          value: "lang",
          align: "center",
          sortable: false,
          width: "80",
        },
        {
          text: this.$t("Translation"),
          value: "translation",
          align: "start",
          sortable: false,
          //          class: "caption"
          //          width: "80%"
          width: "100%",
        },
        {
          text: this.$t("Actions"),
          value: "action",
          align: "end",
          sortable: false,
          //          class: "caption"
          width: "75",
        },
      ];
    },
    editExpandList() {
      if (this.editExpand) {
        const trans = this.editExpand.trans;
        // console.log("editExpandList", trans);
        if (trans)
          return Object.keys(trans).map((l) => ({
            lang: l,
            translation: trans[l],
            action: l == this.devLocale,
            wait: false,
          }));
      }
      return [];
    },
  },
  // watch: {},
  methods: {
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

    async addLanguage(key) {
      const that = this;
      const ed = that.editDialog;
      const keys = Object.keys(that.editContent[key]);
      const list = that.config.allLocales.filter((i) => keys.indexOf(i) < 0);
      //          that.$alert(`info:${key}: ${list.join(",")}`);
      if (list.length) {
        ed.createNew = true;
        ed.allLangs = list;
        ed.lang = list[0];
        ed.dialog = true;
        await that.$nextTick();
        try {
          // console.log("try to edit", key, ed);
          const res = await that.translate(key, ed.lang);
          if (res) return (that.editDialog.translation = res);
          else that.$alert({ type: "warning", tt: "No translation!" });
        } catch (e) {
          that.$alert({
            type: "error",
            text: that.$t("Error in translation: {0}", [e]),
          });
        }
      } else
        that.$alert({
          type: "warning",
          text: that.$t("could not find language for '{0}'!", [key]),
        });
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
    rulesNoKeyDuplicates(value) {
      return !value || !this.editContent[value] || "Key exist already!";
    },
    //    ...mapActions(["saveFile", "saveConfig"]),
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
 */
  },
  mounted() {
    //    this.mapSetObject(this.globalWordsFile);
    //    this.mapSetObject(this.editWordsFile);
    // console.log(this.editExpand, this.editExpandList);
  },
};
</script>
