const cloudinary = require("cloudinary")
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
        console.log("file has been successfully uploaded on cloudinary ", 
            response.url);
        return response;
    } catch (error) {
        fs.unlink(localFilePath); // removed the locally saved temporary file 
        // as the upload operation is failed
    }
}

module.exports = uploadOnCloudinary