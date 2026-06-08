<template>
  <v-card class="mx-auto" max-width="500">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img id="image" :src="props.imgSrc" alt="Image to classify" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import ml5 from "ml5";
import { onMounted, ref } from "vue";
import { Result } from "@/types";

const props = defineProps<{
  imgSrc: string;
}>();
let classifier: any;

const results = ref();
async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

function classify() {
  console.log("Classifying image...");
  const img = document.getElementById("image") as HTMLImageElement;

  console.log("Image element:", img);
  classifier.classify(
    img,
    (
      error: Error | null,
      results: Array<{ label: string; confidence: number }>,
    ) => {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
      }
    },
  );
}
onMounted(async () => {
  await preload();
  classify();
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
