<template>
  <v-card class="mx-auto" max-width="1200">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img
            ref="img"
            :src="props.imgSrc"
            alt="Image to classify"
            class="object-cover"
          />
        </v-col>
        <v-col>
          <h2 class="mb-12 flex justify-center">{{ headline }}</h2>
          <!-- {{ results }} -->
          <div v-if="results && results?.length > 0">
            <Bar :data="data" :options="options" />
          </div>
          <div class="flex justify-center" v-else>
            <v-progress-circular
              :size="200"
              :width="15"
              color="rgba(75, 192, 192, 0.5)"
              indeterminate
            ></v-progress-circular>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import ml5 from "ml5";
import { computed, onMounted, ref, useTemplateRef } from "vue";
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
  },
};
const props = defineProps<{
  imgSrc: string;
  correct: boolean;
}>();
let classifier: any;

const img = useTemplateRef("img");

const results = ref<Result[]>();
async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

const headline = computed(() => {
  let correctWording = props.correct ? "Correct" : "Wrong";
  let suffix =
    results.value && results.value.length > 0 ? correctWording : "...";

  return `Classification result: ${suffix}`;
});

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
