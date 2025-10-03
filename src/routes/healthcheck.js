const express = require("express")
const healthCheck = require("../controllers/healthcheck.js")

const router = express.Router()
router.route("/").get(healthCheck)

module.exports = router