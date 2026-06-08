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
        <li>
          Data visualization:
          <a
            href="https://www.chartjs.org/"
            target="_blank"
            class="text-primary underline"
            >chart.js</a
          >
        </li>
      </ul>
      <br />
      <p>
        Die Webanwendung wurde mit Vue 3 und TypeScript umgesetzt und mit Vite
        als Build- und Development-Tool erstellt. Für die Oberfläche kommen
        Vuetify-Komponenten sowie Tailwind-CSS-Klassen für Layout und Styling.
        Die Bildklassifikation basiert auf ml5.js und dem vortrainierten
        MobileNet-Modell im Browser. Die Visulaisierung der Daten erfolgt mit
        chart.js.
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
        Die Anwendung ist komponentenbasiert aufgebaut. Beim erstmaligen
        Pageload wird ein ml5 <code>Classifier</code> Objekt initiiert und
        preloaded. In einer zentralen Datei werden Bildgruppen mit ihren
        Attributen definiert.
      </p>

      <p></p>
      <pre>
                      const imgPath = (fileName: string): string => {
            return new URL(`./assets/images/${fileName}`, import.meta.url).href;
          };

          export const setupImageGroups = [
            {
              name: "Vorauswahl korrekter Klassifikationen",
              label: true,
              images: [
                imgPath("daisy.jpg"),
                imgPath("tiger-cat.jpg"),
                imgPath("ant.jpg"),
              ],
              order: 1,
              enableUpload: false,
            },
            {
              name: "Vorauswahl falscher Klassifikationen",
              label: false,
              images: [imgPath("book.jpg"), imgPath("cactus.jpg"), imgPath("baby.jpg")],
              order: 2,
              enableUpload: false,
            },
            {
              name: "Klassifikationen von Uploads",
              label: undefined,
              images: [],
              order: 3,
              enableUpload: true,
            },
          ];
                    </pre
      >
      <p>
        Die Anwendung erstellt dynamisch für die definierten Bildgruppen
        einzelne Einzelbild-Container, die einen
        <code>Classify-Request</code> an ml5 sendet, die Antwort mit dem
        Klassifikationsresultat empfängt und als Balkendiagramme anzeigt.
        Zusätzlich können eigene Bilder per Drag-and-drop hochgeladen und im
        gleichen Ablauf ausgewertet werden. <br /><br />

        Um die Performance zu verbessern, werden die Bilder werden lazy an ml5
        gesendet, sobald sie sich im Viewport befinden.
      </p>
    </article>
  </div>
</template>

<script lang="ts" setup></script>
