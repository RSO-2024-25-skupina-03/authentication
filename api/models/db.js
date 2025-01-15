/**
 * Load environment variables
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from 'mongoose';


const connections = {};

const connectToDatabase = async (dbName) => {
    if (connections[dbName]) return connections[dbName];

    let dbURI = `mongodb://mongo:27017/${dbName}`;

    // TODO: REPLACE WITH ACTUAL MONGODB URI
    if (process.env.NODE_ENV === "production")
        dbURI = process.env.MONGODB_PROD_URI + "/" + dbName;
    else if (process.env.NODE_ENV === "test")
        dbURI = process.env.MONGODB_URI + "/" + dbName;

    const connection = await mongoose.createConnection(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // CONNECTION EVENTS LOGS
    mongoose.connection.on("connected", () =>
        console.log(`Mongoose connected to ${dbURI}.`)
    );
    mongoose.connection.on("error", (err) =>
        console.log(`Mongoose connection error: ${err}.`)
    );
    mongoose.connection.on("disconnected", () =>
        console.log("Mongoose disconnected")
    );

    connections[dbName] = connection;
    return connection;
};


const gracefulShutdown = async (msg, callback) => {
    for (const dbName in connections) {
        await connections[dbName].close();
        console.log(`Mongoose disconnected from ${dbName} through ${msg}.`);
    }
    callback();
};



export { gracefulShutdown, connectToDatabase };