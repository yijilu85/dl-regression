<template>
  <v-app>
    <v-main>
      <nav class="p-4 flex gap-8 justify-end">
        <RouterLink to="/">Image Classification</RouterLink>
        <RouterLink to="/home">Go to About</RouterLink>
      </nav>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup></script>
