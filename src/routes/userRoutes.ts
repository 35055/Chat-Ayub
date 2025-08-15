import express from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import authMiddleware, { AuthRequest } from "../middleware/auth-middleware";
import mongoose, { Types } from "mongoose";

const router = express.Router();


// Get all users
router.get("/", authMiddleware, async (req, res) => {
    const users = await User.find({})

    res.status(200).json({ users })
})

router.get("/user/:id", authMiddleware, async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404).json({ message: "Такого user нету" })
    }

    const { username, id } = <IUser>user

    res.status(201).json({ username, id });
})

// Register user
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = new User({ username, password });
        user = await user.save();
        res.status(201).json({ message: "Пользователь создан", id: user.id });
    } catch (error) {
        res.status(400).json({ message: "Ошибка при регистрации" });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: "Неверные данные" });
            return;
        }


        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.json({ token, username, userId: user._id });
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Ошибка при авторизации" });
    }
});


// Change username
router.put("/change-username/:id", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.params.id;
    const { username } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Такого пользователя нет", id: userId });
            return
        }

        const updateData: { username?: string; } = {};

        if (username) updateData.username = username;

        await User.updateOne({ _id: userId }, { $set: updateData });

        res.status(200).json({ message: "Пользователь успешно изменен", id: userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


// Change password
router.put("/edit-password/:id", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.params.id;
    const { password } = req.body;

    if (!password || password.length < 6) {
        res.status(400).json({ message: "Пароль должен содержать минимум 6 символов" });
        return
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Пользователь не найден" });
            return
        }

        user.password = password; // Пароль будет автоматически хеширован в pre-save хуке
        await user.save();

        res.status(200).json({ message: "Пароль успешно обновлен" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});



// Delete user
router.delete("/delete-user/:id", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.params.id;

    if (userId === req.user.id) {
        res.status(403).json({ message: "Ты не можешь удалить себя" });
        return;
    }

    const user = await User.findById(new Types.ObjectId(userId));

    if (!user) {
        res.status(404).json({ message: `Такого user нету`, id: userId });
        return;
    }

    // Удаляем пользователя из базы данных
    await User.deleteOne({ _id: new Types.ObjectId(userId) });

    res.status(200).json({ message: "User был успешно удален", id: userId });
})

export default router;