import * as htmlToImage from "html-to-image";
import NotificationModule from "../components/Common/NotificationModule";

const screenshotOptions = {
  cacheBust: true,
  pixelRatio: window.devicePixelRatio * 2,
  backgroundColor: "#ffffff",

  // prevents external font loading issues
  skipFonts: true,
};

export const downloadScreenshot = async (
  element,
  filename = "capture.png"
) => {
  if (!element) return;

  try {
    const dataUrl = await htmlToImage.toPng(
      element,
      screenshotOptions
    );

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
    const blob = await htmlToImage.toBlob(
      element,
      screenshotOptions
    );

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    // alert("Image copied to clipboard.");
    NotificationModule.notify("Success", "Image Copied to Clipboard.", {type: "info"})

  } catch (err) {
    console.error("Copy screenshot failed:", err);
    NotificationModule.notify("error", "Copy screenshot failed:", {type: "error"})
  }
};