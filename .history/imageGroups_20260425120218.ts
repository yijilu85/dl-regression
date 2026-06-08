export const imageGroups: ImageGroups[] = [
  {
    name: "correct",
    label: true,
    images: [imgPath("cat.jpg"), imgPath("cat.jpg"), imgPath("cat.jpg")],
  },
  { name: "incorrect", label: false, images: [] },
  { name: "own", label: undefined, images: [] },
];

const imgFolderPath = "/src/assets/images/";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
};
