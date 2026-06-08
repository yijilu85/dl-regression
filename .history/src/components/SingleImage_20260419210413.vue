<template>
  <v-card
    class="mx-auto"
    max-width="500"
  >
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
         <img
            id="image"
            src="https://cdn.vuetifyjs.com/images/cards/house.jpg"
            alt="Image to classify"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import ml5 from 'ml5';
import { onMounted } from 'vue';

  const cards = [
    { title: 'Pre-fab homes', src: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', flex: 12 },
    { title: 'Favorite road trips', src: 'https://cdn.vuetifyjs.com/images/cards/road.jpg', flex: 6 },
    { title: 'Best airlines', src: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg', flex: 6 },
  ]

let classifier;

function preload() {
  classifier = ml5.imageClassifier("MobileNet");
    img = loadImage("images/bird.png");

}

onMounted(() => {
  preload();
});
</script>

<style scoped>
@reference "../styles/tailwind.css";

</style>
