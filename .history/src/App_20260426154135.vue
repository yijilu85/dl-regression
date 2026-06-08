<template>
  <v-app>
    <v-main>
      <nav>
        <RouterLink to="/">Go to Home</RouterLink>
        <RouterLink to="/home">Go to About</RouterLink>
      </nav>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup></script>
