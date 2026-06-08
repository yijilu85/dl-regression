<template>
  <div>
    <article class="mb-8">
      <h2 class="text-2xl font-bold mb-4">
        Deep Learning EA 1: Bilderkennung mit ml5
      </h2>
      <p>Yi-Ji Lu<br />BHT Berlin<br />Matrikelnummer: 929655</p>
    </article>
    <article class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Tech Stack</h2>
      <ul>
        <li>
          Frontend framework:
          <a
            href="https://vuejs.org/"
            target="_blank"
            class="text-primary underline"
            >Vue.js</a
          >
        </li>
        <li>
          UI Frontend library:
          <a
            href="https://vuetifyjs.com/en/introduction/why-vuetify/"
            target="_blank"
            class="text-primary underline"
            >Vuetify</a
          >
        </li>
        <li>
          Image classification framework:
          <a
            href="https://ml5js.org/"
            target="_blank"
            class="text-primary underline"
            >ml5.js</a
          >
        </li>
      </ul>
      <br />
      <p>
        Die Webanwendung wurde mit Vue 3 und TypeScript umgesetzt und mit Vite
        als Build- und Development-Tool erstellt. Für die Oberfläche kommen
        Vuetify-Komponenten sowie Tailwind-CSS-Klassen für Layout und Styling.
        Die Bildklassifikation basiert auf ml5.js und dem vortrainierten
        MobileNet-Modell im Browser.
        <br /><br />
        Alle verwendeten Bilder stammen von
        <a
          href="https://unsplash.com/"
          target="_blank"
          class="text-primary underline"
          >unsplash</a
        >.
      </p>
    </article>
    <article>
      <h2 class="text-2xl font-bold mb-4">Implementation</h2>
      <p>
        Die Anwendung ist komponentenbasiert aufgebaut: Bildgruppen enthalten
        einzelne Bildkarten, die jeweils ein Bild laden und klassifizieren. Nach
        der Klassifikation werden die wahrscheinlichsten Labels und ihre
        Konfidenzwerte visualisiert. Zusätzlich können eigene Bilder per
        Drag-and-drop hochgeladen und im gleichen Ablauf ausgewertet werden.
      </p>
      <v-code-block :code="myCode" language="javascript" />
    </article>
  </div>
</template>

<script lang="ts" setup></script>
