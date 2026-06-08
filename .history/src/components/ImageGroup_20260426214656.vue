<template>
  <div class="mb-8">
    <div class="group-header pb-4">
      <h2 class="group-title text-2xl font-bold">{{ groupData.name }}</h2>
      <v-tooltip text="Reset group to original images">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            prepend-icon="mdi-refresh"
            variant="plain"
            @click="resetGroup"
          >
            <template v-slot:prepend>
              <v-icon color="success"></v-icon>
            </template>
            Reset
          </v-btn>
        </template>
      </v-tooltip>
    </div>
    <SingleImage
      v-for="(item, index) in visibleImages"
      :imgSrc="item"
      :key="item"
      :correct="groupData.labelCorrect"
      class="mt-4 mb-4 fade-item"
      @remove="handleRemoveImage(index, visibleImages)"
      :class="{ removing: removingIndex === index }"
    />
    <article v-if="groupData.discussion" class="mt-4 mb-4">
      <p><strong>Diskussion:</strong> {{ groupData.discussion }}</p>
    </article>
    <SingleImage
      v-for="(item, uploadedIndex) in uploadedFilePreviews"
      :key="item.url"
      class="preview-item mt-4 mb-4 fade-item"
      @remove="handleRemoveUploadedImage(uploadedIndex, uploadedFilePreviews)"
      :class="{ removing: removingUploadedIndex === uploadedIndex }"
      :imgSrc="item.url"
      :correct="undefined"
    />
    <FileUpload
      class="mt-4 mb-8"
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

const visibleImages = ref<string[]>([...props.groupData.images]);
const removingIndex = ref<number | null>(null);
const removingUploadedIndex = ref<number | null>(null);

const uploadedFilePreviews = ref<FilePreview[]>([]);
const handleFilesSelected = (filePreview: FilePreview[]) => {
  filePreview.forEach((preview) => {
    if (!uploadedFilePreviews.value.some((p) => p.url === preview.url)) {
      uploadedFilePreviews.value.push(preview);
    }
  });
};

const handleRemoveImage = (index: number, list: string[] | FilePreview[]) => {
  removingIndex.value = index;
  setTimeout(() => {
    list.splice(index, 1);
    removingIndex.value = null;
  }, 300);
};
const handleRemoveUploadedImage = (
  index: number,
  list: string[] | FilePreview[],
) => {
  removingUploadedIndex.value = index;
  setTimeout(() => {
    list.splice(index, 1);
    removingUploadedIndex.value = null;
  }, 300);
};

const resetGroup = () => {
  visibleImages.value = [...props.groupData.images];
  uploadedFilePreviews.value = [];
};

onMounted(async () => {});
</script>

<style scoped>
@reference "../styles/tailwind.css";

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.group-title {
  line-height: 1.2;
}

.fade-item {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-item.removing {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 640px) {
  .group-title {
    font-size: 1.25rem;
  }
}
</style>
