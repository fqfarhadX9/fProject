const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/ApiError.js")
const User = require("../models/user.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const ApiResponse = require("../utils/apiResponse.js")


const registerUser = asyncHandler( async (req, res) => {
   const {username, email, password, fulName} = req.body;
//    console.log("body: ", username, email, password);

if(
    [username, email, password, fulName].some((fields) => 
        fields?.trim === "")
) {
    throw new ApiError(400, "All fields are required")
}

const existedUser = User.findOne({
    $or: [{username}, {email}]
})

if(existedUser) {
    throw new Error(409, "User with email and username already exists")
}

const avtarLocalPath = req.file?.avtar[0]?.path
const coverImgLocalPath = req.file?.coverImage[0]?.path

if(!avtarLocalPath) {
    throw new Error(400, "Avtar file is required")
}

const avtar = uploadOnCloudinary(avtarLocalPath)
const coverImg = uploadOnCloudinary(coverImgLocalPath)

if(!avtar) {
   throw new Error(400, "Avtar file is required")
}

const user = User.create({
    email,
    password,
    fulName,
    username: username.toLowerCase(),
    avtar: avtar.url,
    coverImg: coverImg.url || "",
})

const createdUser = await User.findById(user._id).select(
    "-password, -refreshToken"
)

if(!createdUser) {
    throw new Error(500, "Something went wrong while regestring user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registerd Successfully")
)
})

module.exports = registerUser