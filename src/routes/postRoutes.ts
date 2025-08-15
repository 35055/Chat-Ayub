import express from "express";
import Post, { IPost } from "../models/Post";
import authMiddleware from "../middleware/auth-middleware";
import mongoose, { Types } from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
    const posts = await Post.find();
    res.json({ posts });
});


router.post("/views", async (req, res) => {
    const { postId } = <{ postId: string }>req.body;
    const post = Post.findById(new Types.ObjectId(postId));

    if (!post) {
        res.status(400).json({ message: "Такого поста нету" });
    }

    await Post.updateOne({ _id: postId }, { $inc: { views: 1 } })

    res.status(201).json({ message: "Пост получил просмотр" })

})


// like

router.post("/likes/:id", authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const { userId } = <{ userId: string }>req.body;
    const post = await Post.findById(postId);

    if (!post) {
        return res.status(400).json({ message: "Такого поста нету" });
    }

    if (!userId) {
        return res.status(404).json({ message: "У вас нет доступа" })
    }

    const alreadyLiked = post.likes.some(id => id.toString() === userId);

    if (alreadyLiked) {
        post.likes = post.likes.filter(
            (id) => id.toString() !== userId
        );
    } else {
        post.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save();

    res.json({
        likesCount: post.likes.length,
        likes: post.likes
    });

})


router.post("/", authMiddleware, async (req, res) => {
    const { foto, date, author, postText } = <IPost>req.body;
    if (!foto && !date && !author) {
        res.status(400).json({ message: "Неправильно заполненная информация" })
        return;
    }
    const safePostText = postText ?? "";

    const post = new Post({
        ...req.body,
        postText: safePostText,
        like: [],
        views: 0
    });
    await post.save();

    res.status(201).json({ post });
});

router.put("/:id", authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(new Types.ObjectId(postId));
    const { foto, postText } = <IPost>req.body;

    if (!post) {
        res.status(404).json({ message: `Такого поста нету`, id: postId })
        return;
    }

    await Post.updateOne(
        { _id: postId },
        { $set: { foto, postText } }
    );
    res.status(200).json({ message: "Пост был изменен" });

})

router.delete("/:id", authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findByIdAndDelete(new Types.ObjectId(postId))

    if (!post) {
        res.status(404).json({ message: `Такого поста нету`, id: postId })
        return;
    }

    res.status(200).json({ message: `Пост был успешно удален`, id: postId })
})

export default router;