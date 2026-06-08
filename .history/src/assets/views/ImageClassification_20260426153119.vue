<template>
  <ImageGroup v-for="group in imageGroups" :groupData="group"> </ImageGroup>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { setupImageGroups } from "../../imageGroups";
import ImageGroup from "@/components/ImageGroup.vue";

const imageGroups = computed(() => {
  console.log("Setting up image groups...", setupImageGroups);

  const ordered = setupImageGroups.sort(
    (a, b) => a.order - b.order,
  ) as ImageGroup[];
  return ordered;
});
</script>
