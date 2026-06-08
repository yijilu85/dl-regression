<template>
  elements: {{ visibleImages }}
  <div class="mt-2">
    <SingleImage
      v-for="(item, index) in visibleImages"
      :imgSrc="item"
      :correct="groupData.label"
      class="mt-4 mb-4 fade-item"
      @remove="handleRemoveImage(index)"
      :class="{ removing: removingIndex === index }"
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
import FileUpload from "@/components/FileUpload.vue";

const props = defineProps<{
  groupData: ImageGroup;
}>();

const visibleImages = ref<string[]>(props.groupData.images);
const removingIndex = ref<number | null>(null);

const uploadedFilePreviews = ref<FilePreview[]>([]);
// const files = ref<File[]>([]);
const handleFilesSelected = (filePreview: FilePreview) => {
  console.log("File selected:", filePreview);
  uploadedFilePreviews.value.push(filePreview);
};

const handleRemoveImage = (index: number) => {
  removingIndex.value = index;
  setTimeout(() => {
    visibleImages.value.splice(index, 1);
    removingIndex.value = null;
  }, 300); // match your transition duration
};
onMounted(async () => {
  console.log("Mounted ImageGroup with data:", props.groupData);
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
.fade-item {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-item.removing {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
