const express = require("express")
const verifyJwt = require("../middlewares/authorization.js")
const { createTweet, 
    getUserTweets, 
    updateTweet, 
    deleteTweet } = require("../controllers/tweet.js")

const router = express.Router()
router.use(verifyJwt)

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)


module.exports = router