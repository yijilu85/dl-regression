import { ImageGroups } from "types";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
};

const imgFolderPath = "/src/assets/images/";

export const imageGroups: ImageGroups[] = [
  {
    name: "correct",
    label: true,
    images: [imgPath("cat.jpg"), imgPath("cat.jpg"), imgPath("cat.jpg")],
  },
  {
    name: "incorrect",
    label: false,
    images: [imgPath("bird.jpg"), imgPath("bird.jpg"), imgPath("bird.jpg")],
  },
  { name: "own", label: undefined, images: [] },
];
