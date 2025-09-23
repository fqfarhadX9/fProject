const mongoose = require("mongoose")
const {Schema} = mongoose;
const aggregatepaginate = require("mongoose-aggregate-paginate-v2")

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    video: {
        type: Schema.Types.ObjectId, 
        ref: "Video"
    },
}, {timestamps: true})

commentSchema.plugin(aggregatepaginate);

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment