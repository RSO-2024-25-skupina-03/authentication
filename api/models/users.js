import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { type } from "os";
import e from "express";
import { connectToDatabase } from "./db.js";
dotenv.config();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: User object
 *       properties:
 *         id:
 *           type: string
 *           description: Custom user ID
 *           example: 1
 *         type:
 *           type: string
 *           description: Type of user, can be user or admin
 *           example: user
 *         enum:
 *           - user
 *           - admin
 *         email:
 *           type: string
 *           description: Email of the user
 *           example: janez.novak@test.si
 *         name:
 *           type: string
 *           description: Name of the user
 *           example: Janez Novak
 *         hash:
 *           type: string
 *           description: Hash of the password
 *         salt:
 *           type: string
 *           description: Salt of the password
 *       required:
 *         - id
 *         - type
 *         - email
 *         - name
 *         - hash
 *         - salt
 */

const usersSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: [true, "ID is required!"] },
    type: { type: String, required: [true, "Type is required!"], enum: ["user", "admin"], default: "user" },
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

/**
 * @openapi
 * components:
 *  schemas:
 *    Authentication:
 *     type: object
 *     description: Authentication token of the user.
 *     properties:
 *      token:
 *       type: string
 *       description: JWT token
 *       example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTZiZWRmNDhmOTUzOTViMTlhNjc1ODgiLCJlbWFpbCI6InNpbW9uQGZ1bGxzdGFja3RyYWluaW5nLmNvbSIsIm5hbWUiOiJTaW1vbiBIb2xtZXMiLCJleHAiOjE0MzUwNDA0MTgsImlhdCI6MTQzNDQzNTYxOH0.GD7UrfnLk295rwvIrCikbkAKctFFoRCHotLYZwZpdlE
 *     required:
 *      - token
 */
usersSchema.methods.generateJwt = function () {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign(
        {
            _id: this._id,
            id: this.id,
            email: this.email,
            name: this.name,
            type: this.type,
            exp: parseInt(expiry.getTime() / 1000),
        },
        process.env.JWT_SECRET
    );
};

const getUserModel = async (dbName) => {
    const connection = await connectToDatabase(dbName);
    console.log("Connected to database");
    return connection.model('User', usersSchema, 'Users');
};

export default getUserModel;