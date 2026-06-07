import { createMemoryHistory, createRouter } from "vue-router";

import Regression from "@/assets/views/Regression.vue";
import Documentation from "@/assets/views/Documentation.vue";

const routes = [
  { path: "/", component: Regression },
  { path: "/documentation", component: Documentation },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
