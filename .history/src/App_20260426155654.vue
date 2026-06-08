<template>
  <v-app>
    <v-main>
      <nav class="mt-8 flex gap-8 justify-end">
        <RouterLink activeClass="active" to="/"
          >Image Classification</RouterLink
        >
        <RouterLink activeClass="active" to="/documentation"
          >Documentation</RouterLink
        >
      </nav>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.active {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  text-decoration-color: var(--color-primary);
}
</style>
