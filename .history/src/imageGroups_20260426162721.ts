const imgFolderPath = "/src/assets/images/";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
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
