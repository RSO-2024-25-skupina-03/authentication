import User from "../models/users.js";
import passport from "passport";

/**
 * @openapi
 * /register:
 *  post:
 *    summary: Register new user
 *    description: Register new user
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *      400:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 */

const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password)
        return res.status(400).json({ message: "All fields required." });
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    
    // Check if setPassword method exists
    if (typeof user.setPassword !== 'function') {
        return res.status(500).json({ message: "setPassword method is not defined on User model" });
    }

    user.setPassword(req.body.password);
    try {
        await user.save();
        res.status(200).json({ token: user.generateJwt() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @openapi
 * /login:
 *  post:
 *    summary: Login user
 *    description: Login user
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *      400:
 *        description: Bad request
 *        content:
 *          application/json:
 *            schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 */

const login = (req, res) => {
    if (!req.body.email || !req.body.password)
        return res.status(400).json({ message: "All fields required." });
    else
        passport.authenticate("local", (err, user, info) => {
            if (err) return res.status(500).json({ message: err.message });
            if (user) return res.status(200).json({ token: user.generateJwt() });
            else return res.status(401).json({ message: info.message });
        })(req, res);
};

export default {
    register,
    login,
};