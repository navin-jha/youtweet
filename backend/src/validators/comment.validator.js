import { body } from "express-validator";

const addCommentValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content must have some value"),
  ];
};

const updateCommentValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content must have some value"),
  ];
};

export { addCommentValidator, updateCommentValidator };
