import { Router } from "express";

const router = Router();

// importing middlewares
import { upload, validate, verifyJWT } from "../middlewares/index.js";

// importing validators
import {
  publishVideoValidator,
  updateVideoValidator,
} from "../validators/index.js";

// importing controllers
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";

// configure jwt middleware to all video routes
router.use(verifyJWT);

// declaring routes
router.route("/").get(getAllVideos);

router.route("/create-new").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideoValidator(),
  validate,
  publishVideo
);

router.route("/v/:videoId").get(getVideoById);

router
  .route("/update/:videoId")
  .patch(
    upload.single("thumbnail"),
    updateVideoValidator(),
    validate,
    updateVideo
  );

router.route("/delete/:videoId").delete(deleteVideo);

router.route("/toggle-publish/:videoId").get(togglePublishStatus);

export default router;
