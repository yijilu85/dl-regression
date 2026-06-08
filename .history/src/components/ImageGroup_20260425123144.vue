<template>
  <div>
    <SingleImage
      v-for="image in groupData.images"
      :imgSrc="image"
      :correct="groupData.label"
    />
    <div
      v-for="preview in uploadedFilePreviews"
      :key="preview.url"
      class="preview-item"
    >
      <SingleImage :imgSrc="preview.url" :correct="true" />
    </div>
    <FileUpload
      v-if="groupData.enableUpload"
      @file-selected="handleFilesSelected($event)"
    >
    </FileUpload>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SingleImage from "@/components/SingleImage.vue";

const props = defineProps<{
  groupData: ImageGroup;
}>();

const uploadedFilePreviews = ref<FilePreview[]>([]);
const files = ref<File[]>([]);
const handleFilesSelected = (filePreview: FilePreview) => {
  console.log("File selected:", filePreview);
  uploadedFilePreviews.value.push(filePreview);
};
onMounted(async () => {});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
