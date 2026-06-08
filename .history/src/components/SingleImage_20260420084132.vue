<template>
  <v-card class="mx-auto" max-width="1200">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img ref="my-image" :src="props.imgSrc" alt="Image to classify" />
        </v-col>
        <v-col>
          <h2>Classification Results</h2>
          <!-- {{ results }} -->
          <div v-if="results && results?.length > 0">
            <Bar :data="data" :options="options" />
            <!-- <ul>
              <li v-for="result in results">
                label: {{ result.label }}, <br />
                confidence: {{ result.confidence.toFixed(4) }}
              </li>
            </ul> -->
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import ml5 from "ml5";
import { onMounted, ref, useTemplateRef } from "vue";
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
  labels: [] as string[],
  datasets: [
    {
      label: "Confidence",
      data: [] as number[],
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
    indexAxis: "x",

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

const img = useTemplateRef("my-image");

const results = ref<Result[]>();
async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

function gotResult(res: Result[]) {
  console.log("Classification results:", res);
  res.forEach((element: Result) => {
    data.labels.push(element.label);
    data.datasets[0].data.push(element.confidence);
  });
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

  console.log("Image element:", img.value);
  classifier.classify(img.value, gotResult);
}
onMounted(async () => {
  await preload();
  classify();
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
