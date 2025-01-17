import getUserModel from "../models/users.js";

/**
 * @openapi
 * /{tenant}/username/{user_id}:
 *  get:
 *   summary: Get username by ID
 *   description: Get username by ID
 *   tags: [Users]
 *   parameters:
 *     - in: path
 *       name: tenant
 *       schema:
 *         type: string
 *       required: true
 *       description: Tenant name
 *     - in: path
 *       name: user_id
 *       schema:
 *         type: string
 *       required: true
 *       description: User custom ID
 *   responses:
 *     200:
 *       description: OK
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     400:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 *     404:
 *       description: Not Found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 *     500:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorMessage'
 */

const getUserById = async (req, res) => {
    if (!req.params.user_id)
        return res.status(400).json({ message: "User ID required." });
    try {
        const User = await getUserModel(req.params.tenant);
        
        // console log all the users' ids
        const users = await User.find().select('id');
        console.log(users.map((user) => user.id));

        const user = await User.findOne({ id: req.params.user_id });
        if (!user)
            return res.status(404).json({ message: "User not found." });
        res.status(200).json({ name: user.name });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export default getUserById;