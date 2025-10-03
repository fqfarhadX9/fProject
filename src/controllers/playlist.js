const mongoose = require('mongoose');
const {isvalidObjectId} = mongoose;
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Playlist = require('../models/playlists');
const Video = require('../models/video');
const User = require('../models/user');

const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {name, description} = req.body;

    if(!name?.trim() || !description?.trim()){
        res.status(400);
        throw new Error("All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

   if(!playlist){
        throw new ApiError(500, "Playlist creation failed")
   }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201, 
            "Playlist created successfully", 
            playlist
        )
    )
   
})

const getUserPlaylists = asyncHandler(async (req, res) => { 
    //TODO: get user playlists
    const playlists = await Playlist.aggregate([
        {
            $match: {owner: new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videoDetails"
            }
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
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                videoDetails: 1,
                ownerDetails: {
                    _id: "$ownerDetails._id",
                    name: "$ownerDetails.name",
                }
            }
        }
    ])

    if(!playlists.length){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                [], 
                "No playlists found for this user"
            )
        )   
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlists,
             "User playlists fetched successfully", 
        )
    )
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.aggregate(
        [
            {
                $match: {_id: new mongoose.Types.ObjectId(playlistId)}
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videoDetails"
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            { $unwind: "$ownerDetails" },
            {
                $project: {
                    name: 1,
                    description: 1,
                    createdAt: 1,
                    videoDetails: 1,
                    ownerDetails: {
                        _id: "$ownerDetails._id",   
                        name: "$ownerDetails.name",
                    }
                }
            }
        ]
    )

    if(!playlist.length){  
        throw new ApiError(404, "Playlist not found")
    }
     
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist[0], 
            "Playlist fetched successfully"
        )
    )
     
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // TODO: add video to playlist
    const {playlistId, videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to add videos to this playlist")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video already in playlist")
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist, 
            "Video added to playlist successfully"
        )
    )
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id,

        },
        {
            $pull: {videos: videoId}
        },
        {new: true}
    ).populate("videos")

    if(!playlist){
        throw new ApiError(404, "Playlist not found or you are not authorized to remove videos from this playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist, 
            "Video removed from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(404, "Playlist not found or you are not authorized to delete this playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist, 
            "Playlist deleted successfully"
        )
    )
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params;
    const {name, description} = req.body;

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "All fields are required")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            name,
            description
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or you are not authorized to update this playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            updatedPlaylist, 
            "Playlist updated successfully"
        )
    )   
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}