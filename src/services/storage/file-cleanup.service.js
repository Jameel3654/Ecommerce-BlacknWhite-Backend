import fs from 'fs/promises';

export const removeLocalFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to remove temp file: ${filePath}`, error);
    }
  }
};
