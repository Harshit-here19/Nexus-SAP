import JSZip from "jszip";

import { idbGetItem, idbSetItem, getImageBlob, saveImageBlob } from "./storage";

// Convert Blob to ArrayBuffer
const blobToArrayBuffer = async (blob) => {
  return await blob.arrayBuffer();
};

// Convert ArrayBuffer back to Blob
const arrayBufferToBlob = (buffer, type) => {
  return new Blob([buffer], {
    type,
  });
};

// ===============================
// EXPORT FULL BACKUP ZIP
// ===============================
export const exportFullBackupZip = async ({ userId, tables, getTableData }) => {
  const zip = new JSZip();

  const manifest = {
    version: "2.0",
    type: "full_backup",
    application: "SAP GUI Clone",
    createdAt: new Date().toISOString(),
    userId,
    tables,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // Save tables
  for (const table of tables) {
    const data = getTableData(table);

    zip.file(`tables/${table}.json`, JSON.stringify(data, null, 2));

    // Save images
    if (table === "entertainment_wishlist") {
      for (const item of data) {
        if (!item.imageId) continue;

        const imageBlob = await getImageBlob(userId, item.imageId);

        if (imageBlob) {
          zip.file(`images/${item.imageId}`, imageBlob);
        }
      }
    }
  }

  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });

  const url = URL.createObjectURL(content);

  const link = document.createElement("a");

  link.href = url;
  link.download = `SAP-Full-Backup-${Date.now()}.zip`;

  link.click();

  URL.revokeObjectURL(url);

  return {
    success: true,
    message: "Full backup exported",
  };
};

// ===============================
// RESTORE FULL BACKUP ZIP
// ===============================
export const restoreFullBackupZip = async ({
  userId,
  file,
  saveTableData,
  saveImageBlob,
}) => {
  const zip = await JSZip.loadAsync(file);
  // const zip = await JSZip.loadAsync(file);

  console.log("ZIP FILES:", Object.keys(zip.files));

  const manifest = JSON.parse(await zip.file("manifest.json").async("string"));

  if (manifest.type !== "full_backup") {
    throw new Error("Invalid SAP backup file");
  }

  for (const table of manifest.tables) {
    const fileEntry = zip.file(`tables/${table}.json`);

    if (!fileEntry) continue;

    const data = JSON.parse(await fileEntry.async("string"));

    await saveTableData(table, data);
  }

  // restore images

  const images = Object.keys(zip.files).filter(
    (path) => path.startsWith("images/") && !path.endsWith("/"),
  );

  for (const path of images) {
    const id = path.replace("images/", "");

    const file = zip.file(path);

    if (!file) {
      continue;
    }

    const blob = await file.async("blob");

    await saveImageBlob(userId, id, blob);
  }

  return {
    success: true,
    message: "Backup restored",
  };
};
