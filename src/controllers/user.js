const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const User = require("../models/user.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const ApiResponse = require("../utils/ApiResponse.js")
const jwt = require("jsonwebtoken")
const Subscription = require("../models/subscription.js")
const { default: mongoose } = require("mongoose")

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

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
// console.log('FILES:', req.files);
// console.log('BODY:', req.body);

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

const logInUser = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body
    
    if(!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }

    const {refreshToken, accessToken} = await 
    generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const Options = {
        httpOnly: true,
        secure: true
    }

    return res.
    status(200).
    cookie("accessToken", accessToken, Options).
    cookie("refreshToken", refreshToken, Options).
    json(
        new ApiResponse(
            200, 
            {
               user: loggedInUser, accessToken, 
               refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }

        },
        {
            new: true
        },
    )
    const Options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", Options)
    .clearCookie("refreshToken", Options)
    .json(new ApiResponse(200, {}, "User loged out Successfully"))
})

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    try {
        if(!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request")
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
         const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
         const Options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, Options)
        .cookie("refreshToken", newRefreshToken, Options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Refresh token refreshed" 
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword , newPassword} = req.body;

    const user =  await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect Password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new 
        ApiResponse(
            200, 
            {}, 
            "Password Changed Successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, req.user, "Current User fetched Successfully"
        )
    );

})

const updateAccountDetails = asyncHandler(async (req , res) => {
    const {fulName, email} = req.body

    if(!(fulName || email)) {
        throw new ApiError(400, "All Fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fulName,
                email
            }
        },
        {new: true}
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(
        200, user, "Account details updated Successfully"))
})

const updateUserAvtar = asyncHandler(async (req , res) => {
    const avtarLocalPath = req.file?.path

    if(!avtarLocalPath) {
        throw new ApiError(400, "avtar image is missing")
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath)

    if(!avtar.url) {
        throw new ApiError(
            400, "Error while uploading on avtar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avtar: avtar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200, user, "avtar image updated Successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req , res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "cover image  is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(
            400, "Error while uploading on cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200, user, "cover image updated Successfully"
        )
    )
})

const getUserChanelProfile = asyncHandler( async (req, res) => {
    const {username} = req.params;

    if(!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const chanel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }  
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                SubscribersCount: {
                    $size: "$subscribers"
                },
                ChanelSubscribedTo: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fulName: 1,
                email: 1,
                coverImage: 1,
                avtar: 1,
                SubscribersCount: 1,
                ChanelSubscribedTo: 1,
                isSubscribed: 1,
            }
        }
    ])

    if(!chanel?.length) {
        throw new
         ApiError(404, "Channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, chanel[0], "User channel fetched Successfully")
    )
})

const getWatchHistory = asyncHandler( async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fulName: 1,
                                        avtar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
])
    
    if (!user.length) {
     return res
     .status(404)
     .json(new ApiError(404, [], "User not found"))
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, user[0].watchHistory, "watch history fetched successfully"
        )
    )
})

module.exports = {
    registerUser,
    logInUser,
    logOutUser,
    RefreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvtar,
    updateUserCoverImage,
    getUserChanelProfile,
    getWatchHistory
}