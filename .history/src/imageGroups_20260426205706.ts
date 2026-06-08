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
      "Bei der Auswahl von Bildern für die Gruppe korrekter Klassifikationen ist aufgefallen, dass besonders Bilder mit klaren und gut erkennbaren und vollständig abgebildeten Objekten zuverlässig klassifiziert werden. Besonders Bilder von Tieren oder Pflanzen scheinen im Trainingsmodell gut repräsentiert zu sein, womit auch unter anderem Tier- oder Pflanzenarten zuverlässig unterschieden werden konnten. Das Katzenbild zeigt beispielsweise auch eine mögliche Klassifikation einer Egyptian Cat mit einer geringeren Confidence als eine Tiger Cat.",
  },
  {
    name: "Vorauswahl falscher Klassifikationen",
    labelCorrect: false,
    images: [imgPath("book.jpg"), imgPath("cactus.jpg"), imgPath("baby.jpg")],
    order: 2,
    enableUpload: false,
    discussion:
      "Die Auswahl der Bildern für die Gruppe falsch klassifizierter Bilder war nicht so leicht, da das Modell sehr viele Bilder korrekt oder teilweise korrekt klassifiziert. Aufgefallen ist, dass Bilder falsch klassifiziert wurden, wenn das Objekt nicht vollständig im Bild zu sehen war oder es eine ungewöhnliche Form hatte. Das aufgefächerte Buch aufgrund seiner ungewöhnlichen Form falsch erkannt. Auch der angeschnittene Kaktus wird oft als Ohrenpiercing klassifiziert. Bei dem Bild von Baby wird die Kleidung der Mutter als Laborkitel interpretiert.",
  },
  {
    name: "Klassifikationen von Uploads",
    labelCorrect: undefined,
    images: [],
    order: 3,
    enableUpload: true,
  },
];
