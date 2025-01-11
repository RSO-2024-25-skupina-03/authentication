import express from 'express';
import bodyParser from 'body-parser';
import passport from "passport";

import metricsMiddleware from './prometheus/init.js';

import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

/**
 * Database connection
 */
import "./api/models/db.js";
import "./api/config/passport.js";


/**
 * Loki logger
 */
const logger = getLogger()
logger.info("Starting app...")

/**
 * Create server
 * default port 3000
 */
const port = process.env.PORT || 3000;
const app = express();
app.set('base', '/api/authentication');

// Enable CORS for all routes
import cors from 'cors';
if (process.env.NODE_ENV === 'test') {
    app.use(cors());
}

// middleware
// log the request method and URL for every request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// prometheus metrics
app.use(metricsMiddleware);

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
import swaggerRouter, { forwardedPrefixSwagger, getSwaggerOptions } from "./api/routes/swaggerRouter.js";
app.use("/", apiRouter);
app.use("/", swaggerRouter);

// Middleware to redirect /docs to /docs/
app.use('/docs', (req, res, next) => {
    if (req.originalUrl === '/docs') {
        res.redirect('/docs/');
    } else {
        next();
    }
});


// Use Swagger UI
app.use('/docs', forwardedPrefixSwagger, swaggerUi.serve, (req, res, next) => {
    const swaggerOptions = getSwaggerOptions(req);
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    swaggerUi.setup(swaggerDocs, {
        customCss: '.swagger-ui .topbar { display: none }',
    })(req, res, next);
});

// Say hello world when user visits the root URL
app.get('/', (req, res) => {
    res.send('Hello, this is the root URL of the microservice Authentication. The api is available at / and the documentation is available at /docs');
});

/**
 * Passport
 */
app.use(passport.initialize());

// loki logging middleware
app.use(responseTime(logResponseTime));
// loki error logging middleware
app.use(logError);

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
import { getLogger } from './loki/init.js';
import { logResponseTime } from './loki/responseTimeLogger.js';
import { logError } from './loki/errorLogger.js';
import responseTime from 'response-time';

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