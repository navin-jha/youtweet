import { Router } from "express";

const router = Router();

// importing middlewares
import { validate, verifyJWT } from "../middlewares/index.js";

// importing validators
import {
  createPlaylistValidator,
  updatePlaylistValidator,
} from "../validators/index.js";

// importing controllers
import {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";

// confiuguring jwt middleware for all playlist routes
router.use(verifyJWT);

// declaring routes
router.route("/").post(createPlaylistValidator(), validate, createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylistValidator(), validate, updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:playlistId/:videoId").post(addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").post(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;
