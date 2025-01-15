import getUserModel from "../models/users.js";

/**
 * @openapi
 * /health:
 *  get:
 *    summary: Health check
 *    description: Check if the service is running
 *    tags: [Health]
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorMessage'
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorMessage'
 */

const healthcheck = (req, res) => {
    try {
        res.status(200).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * @openapi
 * /{tenant}/health:
 *  get:
 *    summary: Health check
 *    description: Check if the service is running
 *    tags: [Health]
 *    parameters:
 *      - in: path
 *        name: tenant
 *        required: true
 *        description: The tenant name
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorMessage'
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorMessage'
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorMessage'
 */

const tenantHealthcheck = async (req, res) => {
    try {
        const tenant = req.params.tenant;
        if (!tenant) {
            res.status(400).json({ message: "Tenant is required" });
            return;
        }
        const UserModel = await getUserModel(tenant);
        // Check if the model is connected to the database
        await UserModel.estimatedDocumentCount();
        // If the model is connected, return OK
        res.status(200).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { healthcheck, tenantHealthcheck };

export default healthcheck;