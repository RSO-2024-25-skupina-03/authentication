import { Router } from "express";
const router = Router();
import healthcheck from "../controllers/healthcheck.js";
import { tenantHealthcheck } from "../controllers/healthcheck.js";
import ctrlAuthentication from "../controllers/authentication.js";
import getUserById from "../controllers/users.js";

// Health check
router.get("/health", healthcheck);
router.get("/:tenant/health", tenantHealthcheck);

/**
 * Authentication
 */
router.post("/:tenant/register", ctrlAuthentication.register);
router.post("/:tenant/login", ctrlAuthentication.login);
router.post("/jwt", ctrlAuthentication.verifyToken);

router.get("/:tenant/users", getUserById);

export default router;