<template>
  <v-app>
    <v-main>
      <!-- <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" /> -->
      <!-- <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" /> -->
      <div></div>
      <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" />
      <FileUpload @files-selected="handleFilesSelected($event)"> </FileUpload>
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
import { ref, computed } from "vue";

const uploadedFilePreviews = ref<File[]>([]);
const files = ref<File[]>([]);

const handleFilesSelected = (file: File) => {
  console.log("File selected:", file);
};

const previews = computed<FilePreview[]>(() =>
  files.value.map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    type: "image",
  })),
);
</script>
