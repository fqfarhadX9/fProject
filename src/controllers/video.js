const mongoose = require("mongoose")
const Video = require("../models/video")
const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/ApiError.js")
const ApiResponse = require("../utils/ApiResponse.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let filter = { isPublished: true }
    if(userId) filter.owner = mongoose.Types.ObjectId(userId)
    if(query) filter.title = { $regex: query, $options: "i" }

    const sort = {};
    if (sortBy) {
       sort[sortBy] = sortType === 'desc' ? -1 : 1;
    } else {
       sort.createdAt = -1;
    }

    const aggregate = Video.aggregate()
    .match(filter)
    .lookup(
        {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails"
        }
    )
    .unwind("$ownerDetails")
    .project({
        videoFile: 1,
        thumbnail: 1, 
        title: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        "ownerDetails.name": 1,
        "ownerDetails._id": 1  
    })
    .sort(sort)

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    }

    const videos = await Video.aggregatePaginate(aggregate, options)

    return res
    .status(200)
    .json(
        new ApiResponse( "Videos fetched successfully", videos)
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.file?.path

    if(!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)

    if(!uploadedVideo.url) {
        throw new ApiError(500, "Failed to upload video")
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.url,
        thumbnail: uploadedVideo.thumbnail,
        owner: req.user._id,
        isPublished: true
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, newVideo, "Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId).populate("owner", "name _id")

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description, thumbnail } = req.body

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if(!title && !description && !thumbnail) {
        throw new ApiError(400, "At least one field (title, description, thumbnail) is required to update")
    }
    
    // Only include provided fields
    const updateFields = {}
    if(title) updateFields.title = title
    if(description) updateFields.description = description
    if(thumbnail) updateFields.thumbnail = thumbnail

    const video = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        { $set: updateFields},
        { new: true, runValidators: true },
    )

    if(!video) {
        throw new ApiError(404, "Video not found or you are not the owner")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findOneAndDelete(
        { _id: videoId, owner: req.user._id }
    )

    if(!video) {
        throw new ApiError(404, "Video not found or you are not the owner")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {_id: video._id}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findOne(
        {
            _id: videoId,
            owner: req.user._id
        }
    )

    if(!video) {
        throw new ApiError(404, "Video not found or you are not the owner")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}