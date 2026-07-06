import { uploadImageToCloudinary } from '../services/cloudinary.service.js';
import { removeLocalFile } from '../services/storage/file-cleanup.service.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadProductImage = async (req, res) => {
  if (!req.file?.path) {
    throw new ApiError(400, 'Image file is required');
  }

  try {
    const asset = await uploadImageToCloudinary(req.file.path);
    res.status(201).json({ success: true, asset });
  } finally {
    await removeLocalFile(req.file.path);
  }
};
