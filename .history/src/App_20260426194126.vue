<template>
  <v-app>
    <v-main>
      <nav class="main-nav mt-4 mb-6 sm:mt-8 sm:mb-8">
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
  width: min(100%, 1000px);
  margin: 0 auto;
  padding: 0 1rem 1.5rem;
}

.main-nav {
  width: min(100%, 1000px);
  margin-inline: auto;
  padding: 0 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .main-nav {
    justify-content: center;
    gap: 1rem;
  }
}
</style>
