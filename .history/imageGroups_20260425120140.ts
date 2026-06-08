export const imageGroups: ImageGroups[] = [
  { name: "correct", label: true, images: [] },
  { name: "incorrect", label: false, images: [] },
  { name: "own", label: undefined, images: [] },
];

const imgFolderPath = "/src/assets/images/";

const imgPath = (fileName: string): string => {
  return imgFolderPath + fileName;
};
