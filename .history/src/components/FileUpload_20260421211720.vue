<template>
  <v-sheet
    class="dropzone pa-8 text-center"
    :class="{ dragging: isDragging }"
    border
    rounded
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
  >
    <v-icon size="48" class="mb-4">mdi-cloud-upload</v-icon>
    <p>Drag & drop an image here, or</p>
    <v-file-input
      v-model="files"
      accept="image/*"
      label="Browse files"
      variant="outlined"
      prepend-icon=""
      prepend-inner-icon="mdi-paperclip"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isDragging = ref(false);
const files = ref<File[]>([]);

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const dropped = e.dataTransfer?.files;
  if (dropped?.length) {
    files.value = Array.from(dropped);
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
