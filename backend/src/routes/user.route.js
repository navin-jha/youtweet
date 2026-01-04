import { Router } from "express";

const router = Router();

// importing controllers
import { registerUser } from "../controllers/user.controller.js";

// declaring routes
router.route("/register").post(registerUser);

export default router;
