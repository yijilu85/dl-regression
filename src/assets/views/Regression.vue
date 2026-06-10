<template>
  <RegressionData
    :active="completedStep === 0"
    @finished="completedStep = 1"
    class="mb-6"
  />

  <RegressionTestClean
    :active="completedStep === 1"
    @finished="completedStep = 2"
    class="mb-6"
  />

  <RegressionTestNoisy
    :active="completedStep === 2"
    @finished="handleBestFitFinished"
    class="mb-6"
  />

  <RegressionTestOverfitting
    :active="completedStep === 3"
    :best-fit-epochs="bestFitEpochs"
    class="mb-6"
  />
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
const bestFitEpochs = ref<number>();

const handleBestFitFinished = (result: {
  epochs: number;
  testMse: number;
}): void => {
  bestFitEpochs.value = result.epochs;
  completedStep.value = 3;
};
</script>

<style scoped></style>
