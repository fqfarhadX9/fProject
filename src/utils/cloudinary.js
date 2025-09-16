const cloudinary = require("cloudinary").v2;
const fs = require("fs")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        // console.log("file has been successfully uploaded on cloudinary ", 
        //     response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // removed the locally saved temporary file 
        // as the upload operation is failed
        return null;
    }
}

module.exports = uploadOnCloudinary