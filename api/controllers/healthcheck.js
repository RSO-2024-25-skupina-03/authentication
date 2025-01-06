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

export default healthcheck;