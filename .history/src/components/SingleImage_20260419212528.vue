<template>
  <v-card class="mx-auto" max-width="500">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img id="image" :src="props.imgSrc" alt="Image to classify" />
        </v-col>
        <v-col>
          {{ results }}
          results: {{ results?.length }}
          <h2>Classification Results</h2>
          <div v-if="results?.length > 0">
            <ul>
              <li v-for="result in results">
                label: {{ result.label }}, <br />
                confidence: {{ result.confidence.toFixed(4) }}
              </li>
            </ul>
          </div>
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

const results = ref<Result[]>();
async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

function gotResult(res) {
  console.log("Classification results:", res);
  results.value = res;
  console.log(results);
}
function classify() {
  console.log("Classifying image...");
  const img = document.getElementById("image") as HTMLImageElement;

  console.log("Image element:", img);
  classifier.classify(
    img,
    // (error: Error | null, results: Result[] | undefined) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log("Classification results:", results);
    //     console.log(results);
    //   }
    // },
    gotResult,
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
