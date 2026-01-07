import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("Local file path is missing");
  }

  try {
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file uploaded successfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove tha locally saved temporary file as the upload operation got failed
    throw new Error(error);
  }
};

const removeFromCloudinary = async (publicUrl, resourceType) => {
  if (!publicUrl || !resourceType) {
    throw new Error("Public url or resource type is missing");
  }

  try {
    // reomve the file from cloudinary
    const response = await cloudinary.uploader.destroy(
      publicUrl.match(/[^/]+(?=\.[^./]*$)/)[0],
      {
        resource_type: resourceType,
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export { uploadOnCloudinary, removeFromCloudinary };
