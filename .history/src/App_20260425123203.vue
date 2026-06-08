<template>
  <v-app>
    <v-main>
      <ImageGroup v-for="group in imageGroups" :groupData="group"> </ImageGroup>
      <!-- <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" />
      <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" />
      <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" />
      <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" />
      <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" />
      <SingleImage imgSrc="/src/assets/images/bird.jpg" :correct="true" />
      <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" /> -->
      <!-- <div
        v-for="preview in uploadedFilePreviews"
        :key="preview.url"
        class="preview-item"
      >
        <SingleImage :imgSrc="preview.url" :correct="true" />
      </div>
      <FileUpload @file-selected="handleFilesSelected($event)"> </FileUpload> -->
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import SingleImage from "@/components/SingleImage.vue";
import FileUpload from "./components/FileUpload.vue";
import { ref, computed } from "vue";
import { setupImageGroups } from "./imageGroups";
import ImageGroup from "./components/ImageGroup.vue";

const imageGroups = computed(() => {
  console.log("Setting up image groups...", setupImageGroups);
  // const groups= setupImageGroups.reduce(
  //   (acc, group) => ({ ...acc, [group.name]: group }),
  //   {},
  // );
  const ordered = setupImageGroups.sort(
    (a, b) => a.order - b.order,
  ) as ImageGroup[];
  return ordered;
});
</script>
