const mongoose = require('mongoose')
const Comment = require('../models/comments')
const asyncHandler = require("../utils/asyncHandler.js")
const Video = require('../models/videos.js')
const ApiResponse = require('../utils/ApiResponse.js')
const ApiError = require('../utils/ApiError.js')

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, "Video not found")
    }

    const commentAggregate = Comment.aggregate([
        {
            $match: {video: mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                "ownerDetails._id": 1,
                "ownerDetails.name": 1,
            }
        },
        { $sort: {createdAt: -1 } },
    ])

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
    }

    const comments = await Comment.aggregatePaginate(commentAggregate, options)

    if(!comments) {
        throw new ApiError(500, "Unable to fetch comments")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
        true, 
        200, 
        comments,
        "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, "Video not found")
    }

    const addComment = await Comment.create({
        owner: req.user?._id,
        video: videoId,
        content,
    })

    if(!addComment) {
        throw new ApiError(500, "Unable to add comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
        201, 
        addComment,
        "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
        _id: commentId,
        owner: req.user?._id,
        },
        {content},
        {new: true}
   )

    if(!updatedComment) {
        throw new ApiError(400, "Comment not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
        200, 
        updatedComment,
        "Comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id,
    })

    if(!deletedComment) {
        throw new ApiError(400, "Comment not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
        200, 
        deletedComment,
        "Comment deleted successfully"
        )
    )
})

module.exports = {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}