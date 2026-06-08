<template>
  <div ref="cardRoot">
    <v-card
      :class="`mx-auto ${bgColor}`"
      max-width="1000"
      @mouseover="onHover"
      @mouseleave="onLeave"
    >
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
            <div
              class="mb-8 grid items-center"
              style="grid-template-columns: 1fr auto 1fr"
            >
              <div class="col-start-2 flex flex-col items-center">
                <h2 class="text-center text-medium">{{ confidence }}</h2>
                <h3 class="text-center text-xl font-bold">
                  {{ classificationResultLabel }}
                </h3>
              </div>

              <div class="justify-self-end" :class="{ invisible: !isHovering }">
                <v-btn
                  density="comfortable"
                  icon="$close"
                  variant="plain"
                  @click="$emit('remove')"
                ></v-btn>
              </div>
            </div>
            <div v-if="results && results?.length > 0">
              <Bar :data="data" :options="options" />
            </div>
            <v-alert
              v-else-if="classificationError"
              type="warning"
              variant="tonal"
              density="comfortable"
            >
              {{ classificationError }}
            </v-alert>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { getSharedImageClassifier } from "@/services/ml5Classifier";

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

const data = computed(() => ({
  labels: results.value?.map((r) => r.label) ?? [],
  datasets: [
    {
      label: "Confidence",
      data: results.value?.map((r) => r.confidence) ?? [],
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
}));

const emit = defineEmits<{
  (e: "remove"): void;
}>();
const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    indexAxis: "x",
  },
  scales: {
    y: {
      ticks: {
        callback: (value: any) => `${(value * 100).toFixed(0)}%`,
      },
    },
  },
};
const props = defineProps<{
  imgSrc: string;
  correct: boolean | undefined;
}>();
let classifier: Awaited<ReturnType<typeof getSharedImageClassifier>> | null = null;

const img = useTemplateRef("img");
const cardRoot = useTemplateRef("cardRoot");
const results = ref<Result[]>();
const classificationError = ref<string | null>(null);
let isClassifying = false;
let hasClassified = false;
let observer: IntersectionObserver | null = null;

const ensureImageLoaded = async () => {
  if (!img.value) {
    throw new Error("No image element available.");
  }

  if (img.value.complete) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const element = img.value;

    if (!element) {
      reject(new Error("Image element became unavailable."));
      return;
    }

    const onLoad = () => {
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onError);
      resolve();
    };

    const onError = () => {
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onError);
      reject(new Error("The image could not be loaded."));
    };

    element.addEventListener("load", onLoad, { once: true });
    element.addEventListener("error", onError, { once: true });
  });
};

async function preload() {
  classifier = await getSharedImageClassifier();
}
const isHovering = ref(false);

const onHover = () => {
  isHovering.value = true;
};

const onLeave = () => {
  isHovering.value = false;
};

const confidence = computed(() => {
  let topResult =
    results.value && results.value.length > 0 ? results.value[0] : null;

  let suffix =
    results.value && results.value.length > 0
      ? `${topResult?.confidence ? (topResult.confidence * 100).toFixed(2) + "% confidence" : ""}`
      : "...";
  return `Klassifikation: ${suffix}`;
});
const classificationResultLabel = computed(() => {
  let topResult =
    results.value && results.value.length > 0 ? results.value[0] : null;

  if (topResult) {
    return topResult.label;
  }
});

const bgColor = computed(() => {
  if (classificationError.value) {
    return "bg-amber-50";
  }

  if (results.value && results.value.length > 0) {
    if (props.correct === undefined) return "bg-gray-100";
    return props.correct ? "bg-green-100" : "bg-red-100";
  }

  return "bg-gray-100";
});

function classify() {
  if (!classifier || !img.value || isClassifying || hasClassified) {
    return;
  }

  isClassifying = true;
  classificationError.value = null;

  classifier.classify(img.value, (error, res) => {
    isClassifying = false;

    if (error) {
      classificationError.value = "Classification failed. Please try again later.";
      console.error("Image classification failed", error);
      return;
    }

    if (!Array.isArray(res)) {
      classificationError.value = "Classification failed due to an invalid model response.";
      console.error("Image classification returned a non-array response", res);
      return;
    }

    hasClassified = true;
    results.value = [...res].sort((a, b) => b.confidence - a.confidence);
  });
}

const runClassification = async () => {
  if (hasClassified || isClassifying) {
    return;
  }

  try {
    await ensureImageLoaded();
    await preload();
    classify();
  } catch (error) {
    classificationError.value = "Model could not be loaded. Please try again later.";
    console.error("Model initialization failed", error);
  }
};

const setupLazyClassification = () => {
  if (!cardRoot.value) {
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    runClassification();
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;

      if (entry?.isIntersecting) {
        runClassification();
        observer?.disconnect();
        observer = null;
      }
    },
    {
      root: null,
      rootMargin: "150px",
      threshold: 0.15,
    },
  );

  observer.observe(cardRoot.value);
};

onMounted(async () => {
  setupLazyClassification();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
