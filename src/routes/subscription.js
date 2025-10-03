const express = require("express")
const verifyJwt = require("../middlewares/authorization.js")
const { toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels } = require("../controllers/subscription.js")

const router = express.Router()
router.use(verifyJwt)

router.route("/c/:chanelId")
.post(toggleSubscription)
.get(getSubscribedChannels)

router.route("/user/:subscriberId").get(getUserChannelSubscribers)
module.exports = router