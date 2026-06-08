<template>
  <v-app>
    <v-main>
      <nav class="mt-8 mb-8 flex gap-8 justify-end">
        <RouterLink activeClass="active" to="/">Bild-Klassifikation</RouterLink>
        <RouterLink activeClass="active" to="/documentation"
          >Dokumentation</RouterLink
        >
      </nav>
      <div class="main">
        <RouterView />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { preload } from "../src/imageClassifier";
import { onMounted } from "vue";

onMounted(async () => {
  await preload();
});
</script>

<style lang="scss">
.active {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  text-decoration-color: var(--color-primary);
}
.main {
  width: 1000px;
  margin: 0 auto;
}
</style>
