import express from "express";
import Post, { IPost } from "../models/Post";
import authMiddleware from "../middleware/auth-middleware";
import { Types } from "mongoose";
import Comments, { IComment } from "../models/Comments";

const router = express.Router();

router.get("/", async (req, res) => {
    const comments = await Comments.find();
    res.json({ comments });
});

router.get("/:id", async (req, res) => {
    const postId = req.params.id;
    const comments = await Comments.find({ postId: postId });
    res.json({ comments });
});

router.post("/", authMiddleware, async (req, res) => {
    const { userId, commentText, commentDate, postId } = <IComment>req.body;
    if (!userId && !commentText && !commentDate && !postId) {
        res.status(400).json({ message: "Неправильно заполненная информация" })
        return;
    }

    const comment = new Comments({
        ...req.body
    });
    await comment.save();

    res.status(201).json({ comment });
});

router.put("/:id", authMiddleware, async (req, res) => {
    const commentId = req.params.id;
    const comment = await Comments.findById(new Types.ObjectId(commentId));
    const { commentText, userId } = <IComment>req.body;

    if (!comment) {
        res.status(404).json({ message: `Такого коментария нету`, id: commentId })
        return;
    }

    if (comment.userId.toString() !== userId) {
        res.status(400).json({ message: `У вас нет доступа. Вы не user который создали коммент.`, id: userId })
    }

    if (!commentText) {
        res.status(400).json({ message: "Неправильно заполненная информация" })
        return;
    }

    await Comments.updateOne(
        { _id: commentId },
        { $set: { commentText } }
    );
    res.status(200).json({ message: "Комментарий был изменен" });

})

router.delete("/:id", authMiddleware, async (req, res) => {
    const commentId = req.params.id;
    const comment = await Comments.findByIdAndDelete(new Types.ObjectId(commentId))

    if (!comment) {
        res.status(404).json({ message: `Такого комментария нету`, id: commentId })
        return;
    }

    res.status(200).json({ message: `Комментарий был успешно удален`, id: commentId })
})

export default router;