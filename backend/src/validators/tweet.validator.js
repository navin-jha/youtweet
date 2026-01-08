import { body } from "express-validator";

const createTweetValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Tweet content is required")
      .isLength({ max: 280 })
      .withMessage("Tweet content must not exceed 280 characters"),
  ];
};

const updateTweetValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Tweet content is required")
      .isLength({ max: 280 })
      .withMessage("Tweet content must not exceed 280 characters"),
  ];
};

export { createTweetValidator, updateTweetValidator };
