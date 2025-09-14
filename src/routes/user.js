const {Router} = require("express");
const registerUser = require("../controllers/user.js");
const upload = require("../middlewares/multer.js")

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

module.exports = router