const mongoose = require("mongoose")
const Video = require("../models/video.model.js")
const Subscription = require("../models/subscription.model.js")
const Like = require("../models/like.model.js")
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const ApiResponse = require("../utils/apiResponse.js")

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.params.channelId

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const [totalVideos, totalSubscribers, totalLikes, totalViewsAgg] = await Promise.all([
        Video.countDocuments({channel: channelId}),
        Subscription.countDocuments({channel: channelId}),
        Like.countDocuments({channel: channelId}),
        Video.aggregate([
            {$match: {channel: mongoose.Types.ObjectId(channelId)}},
            {$group: {_id: null, totalViews: {$sum: "$views"}}}
        ])
    ])

    const totalViews = totalViewsAgg[0]? totalViewsAgg[0].totalViews : 0

    return res
    .status(200)
    .json(new 
        ApiResponse(
            200, 
            {totalVideos, 
            totalSubscribers, 
            totalLikes, 
            totalViews}, 
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.params.channelId

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const videos = await Video.find({channel: channelId}).sort({createdAt: -1})

    return res
    .status(200)
    .json(new 
        ApiResponse(
            200, 
            videos, 
            "Channel videos fetched successfully"
        )
    )
})

module.exports = {
    getChannelStats, 
    getChannelVideos
}