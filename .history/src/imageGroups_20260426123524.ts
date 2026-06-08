const imgFolderPath = "/src/assets/images/";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
};

export const setupImageGroups = [
  {
    name: "Preselected correct classifications",
    label: true,
    images: [imgPath("cat.jpg"), imgPath("cat.jpg"), imgPath("cat.jpg")],
    order: 1,
    enableUpload: false,
  },
  {
    name: "Preselected  incorrect classifications",
    label: false,
    images: [imgPath("bird.jpg"), imgPath("bird.jpg"), imgPath("bird.jpg")],
    order: 2,
    enableUpload: false,
  },
  {
    name: "upload",
    label: undefined,
    images: [],
    order: 3,
    enableUpload: true,
  },
];
