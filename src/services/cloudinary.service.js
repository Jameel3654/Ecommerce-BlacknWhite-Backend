import { cloudinary } from '../config/cloudinary.js';

export const uploadImageToCloudinary = async (filePath, folder = 'black-and-white/products') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
  };
};
