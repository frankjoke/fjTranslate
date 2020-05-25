<template>
  <v-dialog v-model="editedItem.show" max-width="500px">
    <template v-slot:activator="{ on }">
      <FjB
        text
        color="primary darken-1"
        v-on="on"
        :label="$t('Add Key')"
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
        v-text="$t('Add a new Key for translation')"
      />
      <v-card-text>
        <v-container>
          <v-row>
            <v-text-field
              :autofocus="!editedItem.devText"
              v-model="editedItem.name"
              :hint="$t('No duplicates allowed!')"
              :rules="[rulesNoKeyDuplicates]"
              hide-details="auto"
              :label="$t('New Key')"
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
          :label="$t('cancel')"
          img="mdi-cancel"
          @click.stop="editedItem.show = false"
        />
        <FjB
          color="success darken-2"
          text
          img="mdi-check"
          right
          :label="$t('Save')"
          :disabled="!editedItem.name"
          @click="saveEditAdd"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import helperMixin from "../plugins/helper";

export default {
  name: "EditItemDialog",
  mixins: [helperMixin],

  data() {
    return {};
  },
  props: {
    editedItem: {
      type: Object,
      default: () => ({}),
      required: true,
    },
  },
  // computed: {},
  // watch: {},
  methods: {
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
  },
};
</script>
