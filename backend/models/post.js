import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },   
    },
    {timestamps: true }
);

const postSchema =  new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        caption: {
            type: String,
            default: "",
            trim: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",    
            }
        ],
        comments: [commentSchema],
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;