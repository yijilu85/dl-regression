const imgFolderPath = "/src/assets/images/";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
};

export const setupImageGroups = [
  {
    name: "incorrect",
    label: false,
    images: [imgPath("bird.jpg"), imgPath("bird.jpg"), imgPath("bird.jpg")],
    order: 2,
  },
  {
    name: "correct",
    label: true,
    images: [imgPath("cat.jpg"), imgPath("cat.jpg"), imgPath("cat.jpg")],
    order: 1,
  },
  {
    name: "own",
    label: undefined,
    images: [],
    order: 3,
  },
];
