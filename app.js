import express from 'express';
import bodyParser from 'body-parser';
import passport from "passport";

/**
 * Database connection
 */
import "./api/models/db.js";
import "./api/config/passport.js";


/**
 * Create server
 * default port 3000
 */
const port = process.env.PORT || 3000;
const app = express();

/**
 * Swagger and OpenAPI
 */
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const getSwaggerOptions = (req) => {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}/api`;

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
                    url: "http://localhost:8004/api",
                    description: "Server when running on docker-compose with other microservices",
                },
                {
                    url: "http://localhost:3000/api",
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

// Use Swagger UI
app.use('/api/docs', swaggerUi.serve, (req, res, next) => {
    const swaggerOptions = getSwaggerOptions(req);
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    swaggerUi.setup(swaggerDocs, {
        customCss: '.swagger-ui .topbar { display: none }',
    })(req, res, next);
});

// Serve Swagger JSON
app.get('/api/swagger.json', (req, res) => {
    const swaggerOptions = getSwaggerOptions(req);
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    res.status(200).json(swaggerDocs);
});

// middleware
// log the request method and URL for every request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

/**
 * Body parser (application/x-www-form-urlencoded)
 * must be before the routes
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * API routing
 */
import apiRouter from "./api/routes/api.js";
app.use("/api", apiRouter);


// Say hello world when user visits the root URL
app.get('/', (req, res) => {
    res.send('Hello, this is the root URL of the microservice Authentication. The api is available at /api and the documentation is available at /api/docs');
});

/**
 * Passport
 */
app.use(passport.initialize());

// Error handling middleware
// should be added after all other routes and middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


// listen for requests on port 
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
import { gracefulShutdown } from "./api/models/db.js";

const shutdown = (msg) => {
    console.log(`${msg} signal received: closing HTTP server Orders`);
    server.close(() => {
        console.log('HTTP server closed');
        // Call the gracefulShutdown function from db.js
        gracefulShutdown(msg, () => process.exit(0));
    });
};

process.on('SIGTERM', () => shutdown('Cloud-based app shutdown (SIGTERM)'));
process.on('SIGINT', () => shutdown('app termination (SIGINT)'));
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => process.kill(process.pid, 'SIGUSR2'));
});