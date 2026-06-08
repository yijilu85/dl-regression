<template>
  <v-app>
    <v-main>
      <nav class="p-4 flex gap-8 justify-end">
        <RouterLink
          activeClass="border-indigo-500"
          exactActiveClass="border-indigo-700"
          to="/"
          >Image Classification</RouterLink
        >
        <RouterLink to="/home">Documentation</RouterLink>
      </nav>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup></script>
