import { Router } from "express";

const router = Router();

// importing validators
import {
  registerUserValidator,
  loginUserValidator,
  resendEmailVerificationValidator,
  forgotPasswordRequestValidator,
  resetForgotPasswordValidator,
  changeCurrentPasswordValidator,
  updateAccountDetailsValidator,
} from "../validators/index.js";

// importing middlewares
import { limiter, upload, validate, verifyJWT } from "../middlewares/index.js";

// importing controllers
import {
  registerUser,
  resendEmailVerification,
  verifyEmail,
  forgotPasswordRequest,
  resetForgotPassword,
  loginUser,
  getUserChannelProfile,
  getCurrentUser,
  getWatchHistory,
  refreshAccessToken,
  changeCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  logoutUser,
} from "../controllers/user.controller.js";

// declaring routes

// unsecured routes
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

router
  .route("/resend-verification")
  .patch(
    limiter,
    resendEmailVerificationValidator(),
    validate,
    resendEmailVerification
  );

router.route("/verify-email/:verificationToken").get(verifyEmail);

router
  .route("/forgot-password")
  .patch(
    limiter,
    forgotPasswordRequestValidator(),
    validate,
    forgotPasswordRequest
  );

router
  .route("/reset-password/:resetToken")
  .patch(resetForgotPasswordValidator(), validate, resetForgotPassword);

router.route("/login").post(loginUserValidator(), validate, loginUser);

// secured routes
router.route("/current-user").get(verifyJWT, getCurrentUser);

router
  .route("/channel-profile/:username")
  .get(verifyJWT, getUserChannelProfile);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

router.route("/refresh-token").get(verifyJWT, refreshAccessToken);

router
  .route("/change-password")
  .patch(
    verifyJWT,
    changeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router
  .route("/update-account")
  .patch(
    verifyJWT,
    updateAccountDetailsValidator(),
    validate,
    updateAccountDetails
  );

router.route("/logout").get(verifyJWT, logoutUser);

export default router;
