<template>
  <div class="documentation-view">
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
          Frontend Framework:
          <a
          href="https://vuejs.org/"
          target="_blank"
          class="text-primary underline"
          >Vue.js</a
          >
        </li>
        <li>
          Build Tool
          <a
            href="https://vite.dev/"
            target="_blank"
            class="text-primary underline"
            >Vite</a
          >
        </li>
        <li>
          Frontend UI Library:
          <a
            href="https://vuetifyjs.com/en/introduction/why-vuetify/"
            target="_blank"
            class="text-primary underline"
            >Vuetify</a
          >
        </li>
        <li>
          Image Classification Framework:
          <a
            href="https://ml5js.org/"
            target="_blank"
            class="text-primary underline"
            >ml5.js</a
          >
        </li>
        <li>
          Data Visualization:
          <a
            href="https://www.chartjs.org/"
            target="_blank"
            class="text-primary underline"
            >chart.js</a
          >
        </li>
        <li>
          Hosting, Deployment und CI/CD:
          <a
            href="https://github.com/"
            target="_blank"
            class="text-primary underline"
            >Github Pages/Github Actions</a
          >
        </li>
      </ul>
      <p>
        Die Webanwendung wurde mit Vue 3, TypeScript und mit Vite
        als Build-Tool umgesetut. Für die Oberfläche kommen
        Vuetify-Komponenten sowie Tailwind-CSS-Klassen für Layout und Styling.
        Die Bildklassifikation basiert auf ml5.js und dem vortrainierten
        MobileNet-Modell. Die Visulasierung der Daten erfolgt mit
        chart.js.  
      <p>
        Das Hosting und Deployment erfolgt über Github Pages, die CI/CD-Pipeline
        wird mit Github Actions umgesetzt.
      </p>
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
      <pre class="doc-code-block"><strong>Bildgruppen-Definition</strong>
        {{ rawDefinition }}
      </pre>
      <p>
        Die Anwendung erstellt dynamisch für die definierten Bildgruppen
        einzelne Einzelbild-Container, die jeweils einen
        <code>Classify-Request</code> an ml5 senden. Die Antworten mit dem
        Klassifikationsresultat werden für jedes Bild als Balkendiagramme anzeigt.
        Zusätzlich können eigene Bilder per Drag-and-drop hochgeladen und im
        gleichen Ablauf klassifiziert werden.
      </p>
      <pre class="doc-code-block"> <strong
          >Dynamisches Rendering der Bildgruppen und ihrer Bildelemente</strong
        >
       {{ rawTemplate }}
      </pre>
      <p>
        Um die Performance zu verbessern, werden erfolgt der
        <code>Classify Request</code> an ml5 für ein Bild erst lazy, sobald sich
        das Bild im Viewport befindet.
      </p>
      <p>
        Für ein angenehmes Handling im Interface wurde eine Funktionalität
        eingebaut, um Bild-Elemente aus ihrer Gruppe zu entfernen und die Gruppe
        auf den Originalzustand wieder zu resetten.
      </p>
    </article>
  </div>
</template>

<script lang="ts" setup>
const rawDefinition = `
export const setupImageGroups = [
  {
    name: "Vorauswahl korrekter Klassifikationen",
    labelCorrect: true,
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
    labelCorrect: false,
    images: [imgPath("book.jpg"), imgPath("cactus.jpg"), imgPath("baby.jpg")],
    order: 2,
    enableUpload: false,
  },
  {
    name: "Klassifikationen von Uploads",
    labelCorrect: undefined,
    images: [],
    order: 3,
    enableUpload: true,
  },
];`;
const rawTemplate = `
  <SingleImage
    v-for="(item, index) in visibleImages"
    :imgSrc="item"
    :correct="groupData.labelCorrect"
    class="mt-4 mb-4 fade-item"
    @remove="handleRemoveImage(index, visibleImages)"
    :class="{ removing: removingIndex === index }"
  />
  <article v-if="groupData.discussion" class="mt-4 mb-4">
    <p><strong>Diskussion:</strong> {{ groupData.discussion }}</p>
  </article>
  <SingleImage
    v-for="(item, uploadedIndex) in uploadedFilePreviews"
    :key="item.url"
    class="preview-item mt-4 mb-4 fade-item"
    @remove="handleRemoveUploadedImage(uploadedIndex, uploadedFilePreviews)"
    :class="{ removing: removingUploadedIndex === uploadedIndex }"
    :imgSrc="item.url"
    :correct="undefined"
  />
  <FileUpload
    class="mt-4 mb-8"
    v-if="groupData.enableUpload"
    @file-selected="handleFilesSelected($event)"
  >
  </FileUpload>`;
</script>

<style scoped>
.documentation-view {
  width: 100%;
  min-width: 0;
}

.doc-code-block {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  background: #f1f6ff;
  color: inherit;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 0.9rem;
  margin: 1rem 0;
}

@media (max-width: 640px) {
  .doc-code-block {
    padding: 0.7rem;
    font-size: 0.75rem;
  }
}
</style>
