const express = require("express")
const verifyJwt = require("../middlewares/authorization.js")
const { getChannelStats, getChannelVideos } = require("../controllers/dashboard.js")

const router = express.Router()
router.use(verifyJwt)

router.route("/stats").get(getChannelStats)
router.route("/videos").get(getChannelVideos)

module.exports = router