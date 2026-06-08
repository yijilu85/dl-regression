const imgPath = (fileName: string): string => {
  return new URL(`./assets/images/${fileName}`, import.meta.url).href;
};

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
    discussion:
      "die erste Gruppe enthält Bilder, die von MobileNet korrekt klassifiziert werden. Sie dient als Referenz für die Funktionsweise des Klassifikators und ermöglicht es den Nutzer:innen, die Ergebnisse der Klassifikation besser zu verstehen und einzuordnen.",
  },
  {
    name: "Vorauswahl falscher Klassifikationen",
    labelCorrect: false,
    images: [imgPath("book.jpg"), imgPath("cactus.jpg"), imgPath("baby.jpg")],
    order: 2,
    enableUpload: false,
    discussion:
      "die erste Gruppe enthält Bilder, die von MobileNet korrekt klassifiziert werden. Sie dient als Referenz für die Funktionsweise des Klassifikators und ermöglicht es den Nutzer:innen, die Ergebnisse der Klassifikation besser zu verstehen und einzuordnen.",
  },
  {
    name: "Klassifikationen von Uploads",
    labelCorrect: undefined,
    images: [],
    order: 3,
    enableUpload: true,
  },
];
