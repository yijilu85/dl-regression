declare interface Result {
  label: string;
  confidence: number;
}

declare interface FilePreview {
  url: string;
  name: string;
  type: "image";
}

declare interface ImageGroup {
  name: "correct" | "incorrect" | "own";
  label: boolean | undefined;
  images: string[];
  order: number;
  enableUpload: boolean;
}
