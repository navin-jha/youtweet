import { body } from "express-validator";

const createPlaylistValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 200 })
      .withMessage("Description must be less than 200 characters"),
  ];
};

const updatePlaylistValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 200 })
      .withMessage("Description must be less than 200 characters"),
  ];
};

export { createPlaylistValidator, updatePlaylistValidator };
