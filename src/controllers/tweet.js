const mongoose = require("mongoose")
const { isValidObjectId } = mongoose
const Tweet = require("../models/tweets")
const User = require("../models/user")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const asyncHandler = require("../utils/asyncHandler")   
const Tweet = require("../models/tweets")


const createTweet = asyncHandler(async (req, res) => {
     //TODO: create tweet
    const {content} = req.body
    const userid = req.user?._id

    if(!isValidObjectId(userid)){
        throw new ApiError(400, "Invalid user id")
    }

    if(!content?.trim()){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: userid
    })

    if(!tweet){
        throw new ApiError(500, "Tweet creation failed")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully", 
        )
    )
   
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userid = req.params.userid

    if(!isValidObjectId(userid)){
        throw new ApiError(400, "Invalid user id")
    }

   const Tweets = await Tweet.aggregate(
    [
        {
            $match: {owner: new mongoose.Types.ObjectId(userid)}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "tweetDetails"
            }
        },
        {
            $unwind: "$tweetDetails"
        },
        {
            $project: {
                username: "$tweetDetails.username",
                avatar: "$tweetDetails.avatar",
                content: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
    ]
   )

   if(!Tweets?.length){
    throw new ApiError(404, "No tweets found for this user")
   }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            Tweets,
            "User tweets fetched successfully", 
        )
    )


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const tweetId = req.params.tweetid
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    if(!content?.trim()){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId, 
            owner: req.user?._id,
        },
        {
            $set: {
                content: content?.trim(),
            }
        },
        { new: true,}
    )

     if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully", 
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const tweetId = req.params.tweetid

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user?._id,
    })

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet deleted successfully", 
        )
    )
})

module.exports = {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}