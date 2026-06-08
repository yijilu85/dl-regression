<template>
  elements: {{ visibleImages }} uplöoaded: {{ uploadedFilePreviews }}
  <div class="mt-2">
    <SingleImage
      v-for="(item, index) in visibleImages"
      :imgSrc="item"
      :correct="groupData.label"
      class="mt-4 mb-4 fade-item"
      @remove="handleRemoveImage(index, visibleImages)"
      :class="{ removing: removingIndex === index }"
    />
    <SingleImage
      v-for="(item, uploadedIndex) in uploadedFilePreviews"
      :key="item.url"
      class="preview-item mt-4 mb-4 fade-item"
      @remove="handleRemoveUploadedImage(uploadedIndex, uploadedFilePreviews)"
      :class="{ removing: removingUploadedIndex === uploadedIndex }"
      :imgSrc="item.url"
      :correct="true"
    />
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
const removingUploadedIndex = ref<number | null>(null);

const uploadedFilePreviews = ref<FilePreview[]>([]);
const handleFilesSelected = (filePreview: FilePreview) => {
  console.log("File selected:", filePreview);
  uploadedFilePreviews.value.push(filePreview);
};

const handleRemoveImage = (index: number, list: string[] | FilePreview[]) => {
  removingIndex.value = index;
  console.log("Removing image at index:", index, list);
  setTimeout(() => {
    list.splice(index, 1);
    removingIndex.value = null;
  }, 300);
};
const handleRemoveUploadedImage = (
  index: number,
  list: string[] | FilePreview[],
) => {
  console.log("Removing image at index:", index, list);
  removingUploadedIndex.value = index;
  setTimeout(() => {
    list.splice(index, 1);
    removingUploadedIndex.value = null;
  }, 300);
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
