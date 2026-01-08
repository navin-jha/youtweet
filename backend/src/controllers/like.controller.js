import { ApiResponse, asyncHandler } from "../utils/index.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Video unliked successfully" }));
  } else {
    await Like.create({ video: videoId, likedBy: req.user._id });
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Video liked successfully" }));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const likedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likedComment) {
    await Like.findByIdAndDelete(likedComment._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Comment unliked successfully" }));
  } else {
    await Like.create({ comment: commentId, likedBy: req.user._id });
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Comment liked successfully" }));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const likedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likedTweet) {
    await Like.findByIdAndDelete(likedTweet._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Tweet unliked successfully" }));
  } else {
    await Like.create({ tweet: tweetId, likedBy: req.user._id });
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Tweet liked successfully" }));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$likedVideos",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedVideo: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          owner: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: {
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

const getLikedTweets = asyncHandler(async (req, res) => {
  const likedTweets = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "tweet",
        foreignField: "_id",
        as: "likedTweets",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$likedTweets",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedTweet: {
          _id: 1,
          content: 1,
          createdAt: 1,
          ownerDetails: {
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedTweets, "Liked tweets fetched successfully")
    );
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getLikedTweets,
};
