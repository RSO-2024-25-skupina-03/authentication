import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - hash
 *         - salt
 */

const usersSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: [true, "Email is required!"] },
    name: { type: String, required: [true, "Name is required!"] },
    hash: { type: String, required: [true, "Hash is required!"] },
    salt: { type: String, required: [true, "Salt is required!"] },
});

usersSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
        .toString("hex");
};

usersSchema.methods.validPassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
        .toString("hex");
    return this.hash === hash;
};

usersSchema.methods.generateJwt = function () {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            exp: parseInt(expiry.getTime() / 1000),
        },
        process.env.JWT_SECRET
    );
};

export default mongoose.model("User", usersSchema, "Users");