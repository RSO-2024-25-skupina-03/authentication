import passport from "passport";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import getUserModel from "../models/users.js";

/**
 * @openapi
 * /{tenant}/register:
 *  post:
 *    summary: Register new user
 *    description: Register new user
 *    tags: [Authentication, Users]
 *    parameters:
 *      - in: path
 *        name: tenant
 *        required: true
 *        description: The tenant name
 *        example: tenant1
 *        schema:
 *          type: string
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
 *              type:
 *                type: string
 *                enum: [user, admin]
 *                default: user
 *              adminKey:
 *                type: string
 *              id:
 *                type: string
 *                description: Custom user ID (optional)
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
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 */

const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.type)
        return res.status(400).json({ message: "All fields required." });
    if (req.body.type === "admin" && req.body.adminKey !== process.env.ADMIN_KEY)
        return res.status(400).json({ message: "Invalid admin key." });
    const User = await getUserModel(req.tenant);
    //check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already registered." });
    }
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.type = req.body.type;
    if (req.body.id) {
        user.id = req.body.id;
    } else {
        user.id = user._id;
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
 * /{tenant}/generate-test-users:
 *  get:
 *    summary: Generate test users
 *    description: Generate test users
 *    tags: [Authentication, Users]
 *    parameters:
 *      - in: path
 *        name: tenant
 *        required: true
 *        description: The tenant name
 *        example: tenant1
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      400:
 *        description: Bad request
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

const generateTestUsers = async (req, res) => {
    if (!req.params.tenant) {
        return res.status(400).json({ message: "Tenant required" });
    }
    const User = await getUserModel(req.params.tenant);
    // check first if users with id 1-9 already exist
    const existingUsers = await User.find({ id: { $in: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] } });
    if (existingUsers.length > 0) {
        return res.status(400).json({ message: "Test users already exist." });
    }
    const users = [
        {
            name: "Janez Novak",
            email: "janez.novak@test.si",
            password: "test",
            type: "user",
            id: "1"
        },
        {
            name: "Admin",
            email: "admin@test.si",
            password: "test",
            type: "admin",
            id: "2"
        },
        {
            name: "Maja Kranjc",
            email: "maja.kranjc@test.si",
            password: "test",
            type: "user",
            id: "3"
        },
        {
            name: "Peter Horvat",
            email: "peter.horvat@test.si",
            password: "test",
            type: "user",
            id: "4"
        },
        {
            name: "Ana Zupan",
            email: "ana.zupan@test.si",
            password: "test",
            type: "user",
            id: "5"
        },
        {
            name: "Marko Kovač",
            email: "marko.kovac@test.si",
            password: "test",
            type: "user",
            id: "6"
        },
        {
            name: "Eva Novak",
            email: "eva.novak@test.si",
            password: "test",
            type: "user",
            id: "7"
        },
        {
            name: "Luka Vidmar",
            email: "luka.vidmar@test.si",
            password: "test",
            type: "user",
            id: "8"
        },
        {
            name: "Nina Kralj",
            email: "nina.kralj@test.si",
            password: "test",
            type: "user",
            id: "9"
        }
    ];

    try {
        for (const userData of users) {
            const user = new User(userData);
            user.setPassword(userData.password);
            await user.save();
            console.log(`${user.id} User ${user.name} created.`);
        }
        res.status(200).json({ message: "Test users created successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @openapi
 * /{tenant}/login:
 *  post:
 *    summary: Login user
 *    description: Login user
 *    tags: [Authentication, Users]
 *    parameters:
 *      - in: path
 *        name: tenant
 *        required: true
 *        description: The tenant name
 *        example: tenant1
 *        schema:
 *          type: string
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
    if (!req.params.tenant) {
        return res.status(400).json({ message: "Tenant required" });
    }
    if (!req.body.email || !req.body.password)
        return res.status(400).json({ message: "All fields required." });
    else
        passport.authenticate("local", { session: false }, (err, user, info) => {
            if (err) return res.status(500).json({ message: err.message });
            if (user) return res.status(200).json({ token: user.generateJwt() });
            else return res.status(401).json({ message: info.message });
        })(req, res);
};


/**
 * @openapi
 * /jwt:
 *  post:
 *    summary: Verify JWT token
 *    description: Verify JWT token
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
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

let jwtKey = process.env.JWT_SECRET;
try {
    // Load JWT key from Kubernetes Secret
    jwtKey = fs.readFileSync(path.join('/var/run/secrets/kubernetes.io/serviceaccount', 'JWT_KEY'), 'utf8');
} catch (err) {
    console.error("JWT key not found in Kubernetes Secret. Using key from environment variable.");
}
// Function to verify JWT token
const verifyToken = (req, res) => {
    const token = req.body.token || req.query.token || req.headers['authorization'];
    if (!token) return res.status(400).json({ message: "Token is required." });

    jwt.verify(token, jwtKey, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token." });
        res.status(200).json({ message: "Token is valid." });
    });
};

export default {
    register,
    login,
    verifyToken,
    generateTestUsers
};