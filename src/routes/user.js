const {Router} = require("express");
const registerUser = require("../controllers/user.js");

const router = Router();

router.route("/register").post(registerUser);

module.exports = router