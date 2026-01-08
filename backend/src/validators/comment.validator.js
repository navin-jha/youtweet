import { body } from "express-validator";

const addCommentValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content must have some value")
      .isLength({ max: 500 })
      .withMessage("Comment content must not exceed 500 characters"),
  ];
};

const updateCommentValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content must have some value")
      .isLength({ max: 500 })
      .withMessage("Comment content must not exceed 500 characters"),
  ];
};

export { addCommentValidator, updateCommentValidator };
