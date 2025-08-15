import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization");

    if (!token) {        
        res.status(401).json({ message: "Пройдите регистрацию" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = { id: (decoded as any).id };
        next();
        return
    } catch (error) {
        res.status(401).json({ message: "Токен невалидный" });
    }
};

export default authMiddleware;