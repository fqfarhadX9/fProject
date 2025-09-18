const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.js")
const jwt = require("jsonwebtoken")

const verifyJWT = asyncHandler(async (req, _, next) => {
     try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user =await User.findById(decodedToken._id).select("-refreshToken -password")

         if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user
        next()
     } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
     }
})
module.exports = verifyJWT