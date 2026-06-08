<template>
  <div>
    <SingleImage
      v-for="image in groupData.images"
      :imgSrc="image"
      :correct="groupData.label"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import SingleImage from "@/components/SingleImage.vue";

const props = defineProps<{
  groupData: ImageGroup;
}>();

onMounted(async () => {});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
