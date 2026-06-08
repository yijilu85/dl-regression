<template>
  <v-app>
    <v-main>
      <!-- <SingleImage imgSrc="/src/assets/images/bird.jpg" /> -->
      <SingleImage imgSrc="/src/assets/images/cat.jpg" />
      <v-btn
        class="m-2"
        icon="mdi-theme-light-dark"
        location="top right"
        position="absolute"
        @click="$vuetify.theme.cycle()"
      />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import SingleImage from "@/components/SingleImage.vue";
</script>
