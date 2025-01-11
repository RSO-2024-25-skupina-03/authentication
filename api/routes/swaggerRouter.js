import { Router } from "express";
import swaggerJsDoc from "swagger-jsdoc";


const router = Router();

export const forwardedPrefixSwagger = (req, res, next) => {
    req.originalUrl = (req.headers['x-forwarded-prefix'] || '') + req.url;
    if (req.originalUrl.endsWith('/docs')) {
        req.originalUrl += '/';
    }
    next();
};

export const getSwaggerOptions = (req) => {
    const protocol = req.protocol;
    const host = req.get('host');
    const forwardedPrefix = req.headers['x-forwarded-prefix'] || '';
    const baseUrl = `${protocol}://${host}${forwardedPrefix}`;


    return {
        definition: {
            openapi: "3.1.0",
            info: {
                title: "Macje storitve - Authentication",
                version: "0.1.0",
                description: "API for the microservice Orders",
            },
            tags: [
                {
                    name: "Health",
                    description: "Health check",
                },
                {
                    name: "Users",
                    description: "User management",
                },
                {
                    name: "Authentication",
                    description: "Authentication",
                },
            ],
            servers: [
                {
                    url: baseUrl,
                    description: "Current server",
                },
                {
                    url: "http://localhost:8004",
                    description: "Server when running on docker-compose with other microservices",
                },
                {
                    url: "http://localhost:3000",
                    description: "Development server for testing",
                },
            ],
            components: {
                schemas: {
                    ErrorMessage: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                description: "Message describing the error.",
                            },
                        },
                        required: ["message"],
                    },
                },
            },
        },
        apis: ["./api/models/*.js", "./api/controllers/*.js"],
    };
};

// Serve Swagger JSON
router.get('/swagger.json', (req, res) => {
    const swaggerOptions = getSwaggerOptions(req);
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    res.status(200).json(swaggerDocs);
});

export default router;