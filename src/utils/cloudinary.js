import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET 
});



const uploadOnCloudinary = async ( localFilePath ) => {
    try{
        if(!localFilePath){
            // console.log("Returned null");
            return null;
        }
        // console.log(localFilePath);
        // uploading the file on cloudinary
        // console.log("Till thissss");
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        }).catch((error) => {
            console.log("Cloudinary error : ",error);
        })
        // console.log("Till this");
        // after successfully uploading of the file

        // console.log("File is uploaded on cloudinary : ", response.url);
        // console.log("Response : ", response);
        fs.unlinkSync(localFilePath);
        return response;


    }catch(err){
        fs.unlinkSync(localFilePath) // removing the local saved file on encountering uploading error
        return null;
    }
}


export  { uploadOnCloudinary };







