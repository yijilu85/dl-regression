const imgFolderPath = "/src/assets/images/";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
};

export const setupImageGroups = [
  {
    name: "Preselected correct classifications",
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
    name: "Preselected  incorrect classifications",
    label: false,
    images: [imgPath("book.jpg"), imgPath("baby.jpg"), imgPath("bird.jpg")],
    order: 2,
    enableUpload: false,
  },
  {
    name: "Upload for classification",
    label: undefined,
    images: [],
    order: 3,
    enableUpload: true,
  },
];
