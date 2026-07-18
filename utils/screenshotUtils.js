import * as htmlToImage from "html-to-image";

export const downloadScreenshot = async (element, filename = "capture.png") => {
  if (!element) return;

  try {
    const dataUrl = await htmlToImage.toPng(element, {
      cacheBust: true,
      pixelRatio: window.devicePixelRatio * 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Screenshot failed:", err);
  }
};

export const copyScreenshot = async (element) => {
  if (!element) return;

  try {
    const blob = await htmlToImage.toBlob(element, {
      cacheBust: true,
      pixelRatio: window.devicePixelRatio * 2,
      backgroundColor: "#ffffff",
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    alert("Image copied to clipboard.");
  } catch (err) {
    console.error(err);
  }
};
