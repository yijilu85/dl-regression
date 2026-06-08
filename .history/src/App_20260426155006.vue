<template>
  <v-app>
    <v-main>
      <nav class="mx-2 p-4 flex gap-8 justify-end">
        <RouterLink activeClass="underline" to="/"
          >Image Classification</RouterLink
        >
        <RouterLink activeClass="underline" to="/documentation"
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
}
</style>
