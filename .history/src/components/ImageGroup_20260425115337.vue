<template>
  <div>
    <SingleImage imgSrc="/src/assets/images/cat.jpg" :correct="true" />
  </div>
</template>

<script setup lang="ts">
import ml5 from "ml5";
import { computed, onMounted, ref, useTemplateRef } from "vue";

const props = defineProps<{
  imgSrc: string;
  correct: boolean;
}>();

onMounted(async () => {
  await preload();
  classify();
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
