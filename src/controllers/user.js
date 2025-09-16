const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const User = require("../models/user.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const ApiResponse = require("../utils/apiResponse.js")


const registerUser = asyncHandler( async (req, res) => {
   const {username, email, password, fulName} = req.body;
//    console.log("body: ", username, email, password);

if(
    [username, email, password, fulName].some
    ((field) => field?.trim() === "")
) {
    throw new ApiError(400, "All fields are required")
}

const existedUser = await User.findOne({
    $or: [{username}, {email}]
})

if(existedUser) {
    throw new ApiError(409, "User with email and username already exists")
}
console.log('FILES:', req.files);
console.log('BODY:', req.body);

const avtarLocalPath = req.files?.avtar[0]?.path
// const coverImgLocalPath = req.files?.coverImage[0]?.path
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.
coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}

if(!avtarLocalPath) {
    throw new ApiError(400, "Avtar file is required")
}

const avtar = await uploadOnCloudinary(avtarLocalPath)
const coverImg = await uploadOnCloudinary(coverImageLocalPath)

if(!avtar) {
   throw new ApiError(400, "Avtar file is required")
}

const user = await User.create({
    email,
    password,
    fulName,
    username: username.toLowerCase(),
    avtar: avtar.url,
    coverImage: coverImg?.url || "",
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser) {
    throw new ApiError(500, "Something went wrong while regestring user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
})

module.exports = registerUser