const mongoose = require("mongoose")
const ApiResponse = require("../utils/ApiResponse.js")
const ApiError = require("../utils/ApiResponse.js")
const asyncHandler = require("../utils/asyncHandler.js")
const Like = require("../models/like.model.js")

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId) {
        throw new ApiError(400, "Invalid video id")
    }

    const existingLike = await Like.findOne(
        {
            video: videoId, 
            likedBy: req.user?._id
        }
    )

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        const likesCount = await Like.countDocuments({video: videoId})
        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {liked: false, likesCount}, 
            "Video unliked successfully"
            )
        )
    }

    await Like.create(
        {
            video: videoId,
            likedBy: req.user?._id
        }
    )
    const likesCount = await Like.countDocuments({video: videoId})

    return res
    .status(201)
    .json(
        new ApiResponse(
        201, 
        {liked: true, likesCount},
        "Video liked successfully")
    )    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId) {
        throw new ApiError(400, "Invalid comment id")
    }

    const existingLike = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user?._id
        }
    )

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        const likesCount = await Like.countDocuments({comment: commentId})
        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {liked: false, likesCount}, 
            "Comment unliked successfully"
            )
        )
    }

    await Like.create(
        {
            comment: commentId,
            likedBy: req.user?._id
        }
    )
    const likesCount = await Like.countDocuments({comment: commentId})

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {liked: true, likesCount},
            "Comment liked successfully"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const existingLike = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req.user?._id
        }
    )

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        const likesCount = await Like.countDocuments({tweet: tweetId})
        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {liked: false, likesCount}, 
            "Tweet unliked successfully"
            )
        )
    }

    await Like.create(
        {
            tweet: tweetId,
            likedBy: req.user?._id
        }
    )
    const likesCount = await Like.countDocuments({tweet: tweetId})

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {liked: true, likesCount},
            "Tweet liked successfully"
        )
    )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const LikedVideoDetails = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideo"
                }
            },
            { 
                $unwind: "$likedVideo" 
            },
            {
                $project: {
                    _id: 1,
                    video: "$likedVideo",
                    likedBy: 1
                }
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            LikedVideoDetails,
            "Liked videos fetched successfully"
        )
    )   
})

module.exports = {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}