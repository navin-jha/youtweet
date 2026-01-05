import { Router } from "express";

const router = Router();

// importing validators
import { registerUserValidator } from "../validators/index.js";

// importing middlewares
import { upload, validate } from "../middlewares/index.js";

// importing controllers
import { registerUser } from "../controllers/user.controller.js";

// declaring routes
router.route("/register").post(
  registerUserValidator(),
  validate,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
