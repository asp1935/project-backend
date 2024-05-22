import { compareSync } from 'bcrypt';
import { v2 as cloudinary } from cloudinary
import fs from 'fs'            //file system


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (loaclFilePath) => {
    try {
        //if file path not exist
        if (!loaclFilePath) return null
        //upload file to cloudinary
        const responce = await cloudinary.uploader.upload(loaclFilePath, {
            resource_type: 'auto'
        })
        //file has been uploaded succcessfull
        console.log('File uploaded successfully', responce.url);
        return responce;
    } catch (error) {
        //unlinkSync method execue compulsory
        fs.unlinkSync(loaclFilePath)   //remove the locally (local server/our server) saved file if op failed
        return null
    }
}

export {uploadOnCloudinary}