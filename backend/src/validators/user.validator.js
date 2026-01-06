import { body } from "express-validator";

const registerUserValidator = () => {
  return [
    body("fullname").trim().notEmpty().withMessage("Fullname is required"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters long"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isLowercase()
      .withMessage("Email must be in lowercase")
      .isEmail()
      .withMessage("Invalid email format"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

const loginUserValidator = () => {
  return [
    body("usernameOrEmail")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required")
      .isLowercase()
      .withMessage("Username or email must be in lowercase")
      .isLength({ min: 6 })
      .withMessage("Invalid username or email"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

const resendEmailVerificationValidator = () => {
  return [
    body("usernameOrEmail")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required")
      .isLowercase()
      .withMessage("Username or email must be in lowercase")
      .isLength({ min: 6 })
      .withMessage("Invalid username or email"),
  ];
};

const forgotPasswordRequestValidator = () => {
  return [
    body("usernameOrEmail")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required")
      .isLowercase()
      .withMessage("Username or email must be in lowercase")
      .isLength({ min: 6 })
      .withMessage("Invalid username or email"),
  ];
};

const resetForgotPasswordValidator = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

const changeCurrentPasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("Old password is required")
      .isLength({ min: 6 })
      .withMessage("Invalid old password"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ];
};

const updateAccountDetailsValidator = () => {
  return [
    body("fullname")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Fullname is required"),
    body("username")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters long"),
  ];
};

export {
  registerUserValidator,
  loginUserValidator,
  resendEmailVerificationValidator,
  forgotPasswordRequestValidator,
  resetForgotPasswordValidator,
  changeCurrentPasswordValidator,
  updateAccountDetailsValidator,
};
