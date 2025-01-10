import { Router } from "express";
const router = Router();
import healthcheck from "../controllers/healthcheck.js";
import ctrlAuthentication from "../controllers/authentication.js";

// Health check
router.get("/health", healthcheck);
/**
 * Authentication
 */
router.post("/register", ctrlAuthentication.register);
router.post("/login", ctrlAuthentication.login);
router.post("/jwt", ctrlAuthentication.verifyToken);

export default router;