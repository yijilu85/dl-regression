<template>
  <v-card class="mx-auto" max-width="500">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img id="image" :src="props.imgSrc" alt="Image to classify" />
        </v-col>
        <v-col>
          <h2>Classification Results</h2>
          {{ results }}
          <div v-if="results?.length > 0">
            <ul>
              <li v-for="result in results">
                <Bar :data="data" :options="options" />
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
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const data = {
  labels: [],
  datasets: [
    {
      label: "Confidence",
      data: [0.8, 0.6, 0.4],
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
};
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    // title: {
    //   display: true,
    //   text: "Classification Confidence",
    // },
  },
};
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
  // results.value = res;
  // console.log(results);
  results.value = res.map(
    (r) =>
      ({
        label: r.label,
        confidence: r.confidence,
      }) as Result,
  );
}
function classify() {
  console.log("Classifying image...");
  const img = document.getElementById("image") as HTMLImageElement;

  console.log("Image element:", img);
  classifier.classify(img, gotResult);
}
onMounted(async () => {
  await preload();
  classify();
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
