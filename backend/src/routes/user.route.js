import { Router } from "express";

const router = Router();

// importing validators
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/index.js";

// importing middlewares
import { upload, validate } from "../middlewares/index.js";

// importing controllers
import { registerUser, loginUser } from "../controllers/user.controller.js";

// declaring routes
router.route("/register").post(
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
  registerUserValidator(),
  validate,
  registerUser
);

router.route("/login").post(loginUserValidator(), validate, loginUser);

export default router;
