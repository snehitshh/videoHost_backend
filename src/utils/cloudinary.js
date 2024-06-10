/*import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs from "fs";            //file system
          
/*cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_NAME, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});*/
/*cloudinary.config({ 
    cloud_name: 'dwxgymfow', 
    api_key: '323776971944147', 
    api_secret: '8QA2rR7mHJfbdXEe-e17k_PUuNo' 
  });

const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath)  return null
        //uploading file on cloudinary
   const response = await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded succesfully
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath)   //removes the locally saved temporary files which failed to upload
    return null;    
    }
}
  export {uploadOnCloudinary}  */


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

  