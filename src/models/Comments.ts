import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
    userId: string;
    commentText: string;
    commentDate: Date;
    postId: mongoose.Types.ObjectId;
}

export const commentSchema = new Schema<IComment>({
    userId: {
        type: String,
        required: true
    },
    commentText: {
        type: String,
        required: true
    },
    commentDate: {
        type: Date,
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId, ref: "Post"
    }
})


export default mongoose.model<IComment>("Comments", commentSchema);