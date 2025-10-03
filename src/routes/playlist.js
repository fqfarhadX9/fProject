const express = require("express")
const verifyJwt = require("../middlewares/authorization.js")
const { createPlaylist, 
    getUserPlaylists, 
    addVideoToPlaylist, 
    removeVideoFromPlaylist, 
    deletePlaylist, 
    updatePlaylist, 
    getPlaylistById } = require("../controllers/playlist")

const router = express.Router()
router.use(verifyJwt)

router.route("/playlist").post(createPlaylist)
router.route("/user/:userId").get(getUserPlaylists)

router
   .route("/:playlistId")
   .get(getPlaylistById)
   .delete(deletePlaylist)
   .patch(updatePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)
module.exports = router