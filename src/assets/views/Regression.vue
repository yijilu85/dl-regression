<template>
  <RegressionData @finished="completedStep = 1" class="mb-6" />

  <RegressionTestClean
    v-if="completedStep >= 1"
    @finished="completedStep = 2"
    class="mb-6"
  />

  <RegressionTestNoisy
    v-if="completedStep >= 2"
    @finished="completedStep = 3"
    class="mb-6"
  />

  <RegressionTestOverfitting v-if="completedStep >= 3" class="mb-6" />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from "vue";

const RegressionData = defineAsyncComponent(
  () => import("./RegressionData.vue"),
);
const RegressionTestClean = defineAsyncComponent(
  () => import("./RegressionTestClean.vue"),
);
const RegressionTestNoisy = defineAsyncComponent(
  () => import("./RegressionTestNoisy.vue"),
);
const RegressionTestOverfitting = defineAsyncComponent(
  () => import("./RegressionTestOverfitting.vue"),
);

const completedStep = ref(0);
</script>

<style scoped></style>
