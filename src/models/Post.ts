import mongoose, { Schema, Document } from "mongoose";
import { commentSchema, IComment } from "./Comments";


export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    foto: string;
    postText?: string;
    date: Date;
    likes: mongoose.Types.ObjectId[];
    views: number;
}

const postSchema = new Schema<IPost>({
    author: {
        type: Schema.Types.ObjectId, ref: "User",
        required: true
    },
    foto: {
        type: String,
        required: true
    },
    postText: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number }
});


export default mongoose.model<IPost>("Post", postSchema);