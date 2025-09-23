const mongoose = require("mongoose")
const {Schema} = mongoose;

const likeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video: {
        type: Schema.Types.ObjectId, 
        ref: "Video"
    },
    tweet: {
        type: Schema.Types.ObjectId, 
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

const Like = mongoose.model("Like", likeSchema)

module.exports = Like