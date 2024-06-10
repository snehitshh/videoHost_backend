
import dotenv from "dotenv" 
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    console.log("localFilePath", localFilePath);
    // upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded
    // console.log("File uploaded to cloudinary", response.url);
    fs.existsSync(localFilePath) && fs.unlinkSync(localFilePath);
    // console.log("response", response);
    return response;
  } catch (error) {
    fs.existsSync(localFilePath) && fs.unlinkSync(localFilePath); // remove file from local storage if cloudinary upload fails
    return null;
  }
}

export { uploadOnCloudinary };

  