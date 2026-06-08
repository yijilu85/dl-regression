<template>
  <v-app>
    <v-main>
      <div></div>
      <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" />
      <!-- <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" /> -->
      <FileUpload @files-selected=""> </FileUpload>
      <!-- <v-btn
        class="m-2"
        icon="mdi-theme-light-dark"
        location="top right"
        position="absolute"
        @click="$vuetify.theme.cycle()"
      /> -->
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import SingleImage from "@/components/SingleImage.vue";
import FileUpload from "./components/FileUpload.vue";
import { ref } from "vue";

const uploadedFilePreviews = ref<FilePreview[]>([]);
</script>
