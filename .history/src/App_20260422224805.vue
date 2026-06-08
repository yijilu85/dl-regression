<template>
  <v-app>
    <v-main>
      <!-- <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" /> -->
      <!-- <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" /> -->
      <div
        v-for="preview in uploadedFilePreviews"
        :key="preview.url"
        class="preview-item"
      >
        <SingleImage :imgSrc="preview.url" :correct="true" />
      </div>
      <FileUpload @file-selected="handleFilesSelected($event)"> </FileUpload>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import SingleImage from "@/components/SingleImage.vue";
import FileUpload from "./components/FileUpload.vue";
import { ref, computed } from "vue";

const uploadedFilePreviews = ref<FilePreview[]>([]);
const files = ref<File[]>([]);

const handleFilesSelected = (filePreview: FilePreview) => {
  console.log("File selected:", filePreview);
  uploadedFilePreviews.value.push(filePreview);
};
</script>
