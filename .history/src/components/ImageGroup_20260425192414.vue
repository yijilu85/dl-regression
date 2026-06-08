<template>
  elements: {{ visibleImages }}
  <div class="mt-2">
    <transition-group name="fade-up" tag="div" style="position: relative">
      <SingleImage
        v-for="(item, index) in visibleImages"
        :key="item"
        :imgSrc="item"
        :correct="groupData.label"
        class="mt-4 mb-4"
        @remove="handleRemoveImage(index)"
      />
    </transition-group>
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

const uploadedFilePreviews = ref<FilePreview[]>([]);
// const files = ref<File[]>([]);
const handleFilesSelected = (filePreview: FilePreview) => {
  console.log("File selected:", filePreview);
  uploadedFilePreviews.value.push(filePreview);
};

const handleRemoveImage = (index: number) => {
  console.log("Removing image at index:", index);
  // Remove the image from the groupData.images array
  visibleImages.value.splice(index, 1);
};
onMounted(async () => {
  console.log("Mounted ImageGroup with data:", props.groupData);
  // visibleImages.value = props.groupData.images;
});
</script>

<style>
.fade-up-leave-active {
  transition: opacity 0.3s ease;
  position: absolute;
  width: 100%;
}

.fade-up-leave-to {
  opacity: 0;
}

.fade-up-move {
  transition: transform 0.3s ease;
}
</style>
