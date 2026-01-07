import { body } from "express-validator";

const publishVideoValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ];
};

const updateVideoValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ];
};

export { publishVideoValidator, updateVideoValidator };
