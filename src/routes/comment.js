const express = require("express")
const verifyJwt = require("../middlewares/authorization.js")
const { getVideoComments, 
    addComment, 
    updateComment, 
    deleteComment } = require("../controllers/comment.js")

const router = express.Router()
router.use(verifyJwt)

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").patch(updateComment).delete(deleteComment)

module.exports = router