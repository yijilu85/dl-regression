<template>
  <v-sheet
    class="dropzone pa-8 text-center w-100 h-50 flex align-center justify-center mx-auto py-12"
    :class="{ dragging: isDragging }"
    rounded
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div>
      <v-icon size="48" class="mb-4">mdi-cloud-upload</v-icon>
      <p>Drag and drop images</p>
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
    // Revoke old URLs before replacing
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
}
.dragging {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}
</style>
