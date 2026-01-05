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
      .isEmail()
      .withMessage("Invalid email format"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .isAlphanumeric()
      .withMessage("Password must be alphanumeric"),
  ];
};

export { registerUserValidator };
