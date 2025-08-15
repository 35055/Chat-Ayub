import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    username: string;
    password: string;
    // account: string;
    // phonenumber: string;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // account: { type: String, required: true },
    // phonenumber: { type: String, required: true },
});

// Хеширование пароля
UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Метод для сравнения паролей
UserSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);