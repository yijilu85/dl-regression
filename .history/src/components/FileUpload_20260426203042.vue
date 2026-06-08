<template>
  <v-sheet
    class="dropzone text-center w-100 flex align-center justify-center mx-auto"
    :class="{ dragging: isDragging }"
    rounded
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div class="flex flex-col justify-center items-center">
      <v-icon size="44" class="mb-3">mdi-cloud-upload</v-icon>
      <p class="dropzone-label">Drag and drop images</p>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const isDragging = ref(false);
const files = ref<File[]>([]);

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

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const dropped = e.dataTransfer?.files;
  if (dropped?.length) {
    previews.value.forEach((p) => URL.revokeObjectURL(p.url));
    files.value = Array.from(dropped);
    emit("file-selected", previews.value);
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

@media (max-width: 640px) {
  .dropzone {
    min-height: 150px;
    padding: 0.875rem;
  }
}
</style>
