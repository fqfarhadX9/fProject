const express = require("express")
const verifyJWT = require("../middlewares/authorization")
const { toggleVideoLike, 
    toggleCommentLike, 
    toggleTweetLike, 
    getLikedVideos } = require("../controllers/like")

const router = express.Router()
router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/commentId").post(toggleCommentLike)
router.route("/toggle/t/tweetId").post(toggleTweetLike)
router.route("/videos").get(getLikedVideos)

module.exports = router