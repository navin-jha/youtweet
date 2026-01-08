import {
  registerUserValidator,
  loginUserValidator,
  resendEmailVerificationValidator,
  forgotPasswordRequestValidator,
  resetForgotPasswordValidator,
  changeCurrentPasswordValidator,
  updateAccountDetailsValidator,
} from "./user.validator.js";
import {
  publishVideoValidator,
  updateVideoValidator,
} from "./video.validator.js";
import {
  addCommentValidator,
  updateCommentValidator,
} from "./comment.validator.js";
import {
  createTweetValidator,
  updateTweetValidator,
} from "./tweet.validator.js";

export {
  registerUserValidator,
  loginUserValidator,
  resendEmailVerificationValidator,
  forgotPasswordRequestValidator,
  resetForgotPasswordValidator,
  changeCurrentPasswordValidator,
  updateAccountDetailsValidator,
  publishVideoValidator,
  updateVideoValidator,
  addCommentValidator,
  updateCommentValidator,
  createTweetValidator,
  updateTweetValidator,
};
