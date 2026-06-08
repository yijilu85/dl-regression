<template>
  <div>
    <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { setupImageGroups } from "imageGroups";

const props = defineProps<{
  groupName: string;
  correct: boolean;
}>();

onMounted(async () => {});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
