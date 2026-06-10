<template>
  <div class="documentation-view">
    <article class="mb-8">
      <h2 class="text-2xl font-bold mb-4">
        Deep Learning EA 2: Regression mit Tensorflow
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
          Machine Learning Framework
          <a
            href="https://www.tensorflow.org/js"
            target="_blank"
            class="text-primary underline"
            >Tensorflow js</a
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
        Die Webanwendung wurde mit Vue 3, TypeScript und mit Vite als Build-Tool
        umgesetut. Für die Oberfläche kommen Vuetify-Komponenten sowie
        Tailwind-CSS-Klassen für Layout und Styling. Das Training des Modells
        erfolgt in Tensorflow.js. Das Plotten Graphen erfolgt mit Tensorflow
        sowie chart.js.
      </p>

      <p>
        Das Hosting und Deployment erfolgt über Github Pages, die CI/CD-Pipeline
        wird mit Github Actions umgesetzt.
      </p>
    </article>
    <article>
      <h2 class="text-2xl font-bold mb-4">Implementation</h2>
      <p>
        Die Anwendung ist komponentenbasiert aufgebaut. Beim Pageload werden die
        4 Szenarien als eigene Komponenten registriert. Die Generierung der
        Daten, die Erstellung des Modells, Training und Auswertung der Daten
        erfolgt in shared helpers mit variablen Parametern.
      </p>
      <pre
        class="doc-code-block"
      ><strong>Dynamisches Rendering der 4 Szenarien</strong>
       {{ rawTemplate }}
      </pre>
      <p>
        Dabei werden die Daten einer Komponente erst geladen, sofern die
        vorangegangene fertig berechnet ist. Die Anwendung der
        Trainingsparameter und die Auswertung in Form von Tabellen und Charts
        erfolgt dynamisch. Um zu signalisieren, dass eine Berechnung im Gange
        ist, wird das Layout der Elemente so lange mit Skeletons angedeutet, bis
        die Berechnung abgeschlossen ist.
      </p>
      <pre
        class="doc-code-block"
      ><strong>Definition der Epoch-Ranges in R3</strong>
       {{ epochRange }}
      </pre>
      <pre
        class="doc-code-block"
      ><strong>Training der Epoch-Ranges in R3</strong>
       {{ trainingForAllEpochs }}
      </pre>
    </article>
  </div>
</template>

<script lang="ts" setup>
const rawTemplate = `
  <template>
  <RegressionData
    :active="completedStep === 0"
    @finished="completedStep = 1"
    class="mb-6"
  />

  <RegressionTestClean
    :active="completedStep === 1"
    @finished="completedStep = 2"
    class="mb-6"
  />

  <RegressionTestNoisy
    :active="completedStep === 2"
    @finished="handleBestFitFinished"
    class="mb-6"
  />

  <RegressionTestOverfitting
    :active="completedStep === 3"
    class="mb-6"
  />
</template>`;
const epochRange = `
  const trainingResults = ref<TrainingResult[]>(
  [
    100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400,
    1500,
  ].map((epochs) => ({
    epochs,
  })),
);`;
const trainingForAllEpochs = `
  const { noisyTraining, noisyTest } = await getRegressionDataset();

  const tensorTrainingData = convertToTensor(noisyTraining);
  const model = createModel(100);
  let bestFitWeights: ReturnType<typeof model.getWeights> | undefined;
  let lowestTestMse = Number.POSITIVE_INFINITY;

  for (const [index, result] of trainingResults.value.entries()) {
    await trainModel(
      model,
      tensorTrainingData.inputs,
      tensorTrainingData.labels,
      index === 0
        ? result.epochs
        : result.epochs - trainingResults.value[index - 1].epochs,
      32,
      "R3 Training",
      index === 0,
    );

    result.trainingMse = evaluateModel(
      model,
      noisyTraining,
      tensorTrainingData,
    );
    result.testMse = evaluateModel(model, noisyTest, tensorTrainingData);

    if (result.testMse < lowestTestMse) {
      bestFitWeights?.forEach((weight) => weight.dispose());
      bestFitWeights = model.getWeights().map((weight) => weight.clone());
      lowestTestMse = result.testMse;
      bestFitEpochs.value = result.epochs;
      trainingLoss.value = result.trainingMse;
      testLoss.value = result.testMse;
    }
  }

  if (!bestFitWeights) {
    model.dispose();
    return;
  }

  model.setWeights(bestFitWeights);
  bestFitWeights.forEach((weight) => weight.dispose());

  const trainingContainer = noisyTrainDataContainer.value;
  const testContainer = noisyTestDataContainer.value;

  if (!trainingContainer || !testContainer) {
    model.dispose();
    tensorTrainingData.inputs.dispose();
    tensorTrainingData.labels.dispose();
    tensorTrainingData.inputMax.dispose();
    tensorTrainingData.inputMin.dispose();
    return;
  }

  await testModel(
    model,
    noisyTraining,
    tensorTrainingData,
    trainingContainer,
  );

  await testModel(model, noisyTest, tensorTrainingData, testContainer);

  model.dispose();
  tensorTrainingData.inputs.dispose();
  tensorTrainingData.labels.dispose();
  tensorTrainingData.inputMax.dispose();
  tensorTrainingData.inputMin.dispose();

  if (bestFitEpochs.value === undefined || testLoss.value === undefined) {
    return;
  }

  isFinished.value = true;
  emit("finished", {
    epochs: bestFitEpochs.value,
    testMse: testLoss.value,
  });`;
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
