const {Router} = require("express");
const {registerUser, logInUser, logOutUser, RefreshAccessToken} = require("../controllers/user.js");
const upload = require("../middlewares/multer.js")
const verifyJwt = require("../middlewares/authorization.js")

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    );

router.route("/login").post(logInUser)

router.route("/logout").post(verifyJwt, logOutUser)

router.route("/refresh-token").post(RefreshAccessToken)

module.exports = router