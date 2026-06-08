<template>
  <v-sheet
    class="dropzone text-center w-100 flex align-center justify-center mx-auto"
    :class="{ dragging: isDragging }"
    rounded
    role="button"
    tabindex="0"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="openFilePicker"
    @keydown.enter.prevent="openFilePicker"
    @keydown.space.prevent="openFilePicker"
  >
    <div class="flex flex-col justify-center items-center">
      <v-icon size="44" class="mb-3">mdi-cloud-upload</v-icon>
      <p class="dropzone-label">Drag and drop images or click to select</p>
    </div>
  </v-sheet>

  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    multiple
    class="hidden-file-input"
    @change="onFileInputChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue";

const isDragging = ref(false);
const files = ref<File[]>([]);
const fileInput = useTemplateRef("fileInput");

const emit = defineEmits<{
  (e: "file-selected", file: FilePreview[]): void;
}>();

const previews = computed<FilePreview[]>(() =>
  files.value.map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    type: "image",
  })),
);

function applyFiles(fileList: FileList) {
  if (!fileList.length) return;

  previews.value.forEach((p) => URL.revokeObjectURL(p.url));
  files.value = Array.from(fileList);
  emit("file-selected", previews.value);
}

function openFilePicker() {
  fileInput.value?.click();
}

function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const selectedFiles = input.files;

  if (selectedFiles?.length) {
    applyFiles(selectedFiles);
  }

  input.value = "";
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const dropped = e.dataTransfer?.files;
  if (dropped?.length) {
    applyFiles(dropped);
  }
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed rgba(var(--v-border-color), 0.5);
  transition: border-color 0.2s;
  min-height: 190px;
  padding: 1.25rem;
}
.dragging {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.dropzone-label {
  margin: 0;
}

.hidden-file-input {
  display: none;
}

@media (max-width: 640px) {
  .dropzone {
    min-height: 150px;
    padding: 0.875rem;
  }
}
</style>
