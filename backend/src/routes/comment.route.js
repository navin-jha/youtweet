import { Router } from "express";

const router = Router();

// importing middlewares
import { validate, verifyJWT } from "../middlewares/index.js";

// importing validators
import {
  addCommentValidator,
  updateCommentValidator,
} from "../validators/index.js";

// importing controllers
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllerl.js";

// configure jwt middleware to all comment routes
router.use(verifyJWT);

// declaring routes
router
  .route("/:videoId")
  .get(getVideoComments)
  .post(addCommentValidator(), validate, addComment);

router
  .route("/c/:commentId")
  .patch(updateCommentValidator(), validate, updateComment)
  .delete(deleteComment);

export default router;
