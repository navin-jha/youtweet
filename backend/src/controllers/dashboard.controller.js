import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";
import { Playlist } from "../models/playlist.model.js";
import { Tweet } from "../models/tweet.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const videoStats = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "totalVideoLikes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "totalComments",
      },
    },
    {
      $project: {
        totalVideos: 1,
        totalViews: "$views",
        totalVideoLikes: {
          $size: "$totalVideoLikes",
        },
        totalComments: {
          $size: "$totalComments",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: {
          $sum: 1,
        },
        totalViews: {
          $sum: "$totalViews",
        },
        totalLikes: {
          $sum: "$totalLikes",
        },
        totalComments: {
          $sum: "$totalComments",
        },
      },
    },
  ]);

  const totalPlaylists = await Playlist.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $group: {
        _id: null,
        playlistsCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $group: {
        _id: null,
        subscribersCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalTweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $group: {
        _id: null,
        tweetsCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const channelStats = {
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
    totalComments: videoStats[0]?.totalComments || 0,
    totalPlaylists: totalPlaylists[0]?.playlistsCount || 0,
    totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
    totalTweets: totalTweets[0]?.tweetsCount || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelVideos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        createdAt: {
          $dateToParts: { date: "$createdAt" },
        },
        likesCount: {
          $size: "$likes",
        },
        commentsCount: {
          $size: "$comments",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        createdAt: {
          year: 1,
          month: 1,
          day: 1,
        },
        isPublished: 1,
        likesCount: 1,
        commentsCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, "Channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
