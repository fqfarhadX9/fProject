const {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo} = require("../controllers/video.js")
const express = require("express")
const verfyJWT = require("../middlewares/authorization.js")
const upload = require("../middlewares/multer.js")

const router = express.Router()
router.use(verfyJWT)

router
   .route("/")
   .get(getAllVideos)
   .post(upload.fields([
       { name: "videoFile", maxCount: 1 },
       { name: "thumbnail", maxCount: 1 }
   ]), publishAVideo)

router
   .route("/:videoId")
   .get(getVideoById)
   .patch(upload.single("thumbnail"), updateVideo)
   .delete(deleteVideo)

router
    .route("/toggle/publish/:videoId")
    .patch(togglePublishStatus)

module.exports = router