import { Router } from "express";

const router = Router();

// import controllers
import { healthCheck } from "../controllers/healthCheck.controller.js";

// declaring routes
router.route("/").get(healthCheck);

export default router;
