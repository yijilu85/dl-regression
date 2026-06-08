import { createMemoryHistory, createRouter } from "vue-router";

import ImageClassification from "@/assets/views/ImageClassification.vue";
import Documentation from "@/assets/views/Documentation.vue";

const routes = [
  { path: "/", component: ImageClassification },
  { path: "/documentation", component: Documentation },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
