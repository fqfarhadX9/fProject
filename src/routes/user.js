const {Router} = require("express");
const {registerUser, 
    logInUser, 
    logOutUser, 
    RefreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvtar, 
    updateUserCoverImage, 
    getUserChanelProfile, 
    getWatchHistory
} = require("../controllers/user.js");
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

router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)
router.route("/update-avtar").patch(verifyJwt, upload.single("avtar"),updateUserAvtar)
router.route("/update-coverImage").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJwt, getUserChanelProfile)
router.route("/watch-history").get(verifyJwt, getWatchHistory)

module.exports = router