const Subscription = require("../models/subscription.js")
const asyncHandler =  require("../utils/asyncHandler.js")
const ApiResponse = require("../utils/ApiResponse.js")
const ApiError = require("../utils/ApiError.js")


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId) {
        throw new ApiError(400, "Invalid channel id")
    }
    
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    if(existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        const subscribersCount = await Subscription.countDocuments({channel: channelId})
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    subscribed: false,
                    subscribersCount    
                },
                "Unsubscribed successfully"
            )
        )
    }

    await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    })
    const subscribersCount = await Subscription.countDocuments({channel: channelId})

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {
                subscribed: true,
                subscribersCount    
            },
            "Subscribed successfully"
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId) {
        throw new ApiError(400, "Invalid channel id")
    }

    const subscribers = await Subscription.aggregate(
        [
            {
                $match: {channel: mongoose.Types.ObjectId(channelId)}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberDetails"
                }
            },
            {
                $unwind: "$subscriberDetails"
            },
            {
                $project: {
                    username: "$subscriberDetails.username",
                    fulName: "$subscriberDetails.fulName",
                    avtar: "$subscriberDetails.avtar",
                    coverImage: "$subscriberDetails.coverImage",
                    email: "$subscriberDetails.email",
                    createdAt: "$subscriberDetails.createdAt",

                }
            }
        ]
    )

    if(!subscribers?.length) {
        throw new ApiError(404, "No subscribers found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId && subscriberId !== req.user?._id.toString()) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const channelList = await Subscription.aggregate(
        [
            {
                match: {subscriber: mongoose.Types.ObjectId(subscriberId)}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelDetails"
                }
            },
            {
                $unwind: "$channelDetails"
            },
            {
                $project: {
                    username: "$channelDetails.username",
                    fulName: "$channelDetails.fulName",
                    avtar: "$channelDetails.avtar",
                    coverImage: "$channelDetails.coverImage",
                    createdAt: "$channelDetails.createdAt",
                }
            }
        ]
    )

    if(!channelList?.length) {
        throw new ApiError(404, "No subscribed channels found") 
    }

    return res
    .status(200)
    .json( 
        new ApiResponse(
        200, 
        channelList, 
        "Subscribed channels fetched successfully"
        )
    )
})

module.exports = {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}