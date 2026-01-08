import { subscribe } from "diagnostics_channel";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscriberedToSubscriber",
          },
          {
            $addFields: {
              subscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscriberedToSubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscribersCount: { $size: "$subscriberedToSubscriber" },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,
          subscribersCount: 1,
          subscribedToSubscriber: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscriptions = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            from: "vdideos",
            localField: "_id",
            foreignField: "owner",
            as: "vdideos",
          },
          {
            $addFields: {
              latestVideo: {
                $last: "$vdideos",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannel",
    },
    {
      $project: {
        _id: 0,
        subscribedChannel: {
          _id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,
          latestVideo: {
            _id: 1,
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            views: 1,
            createdAt: 1,
            owner: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels fetched successfully"
      )
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribe: !existingSubscription },
        "Subscription toggled successfully"
      )
    );
});

export { getUserChannelSubscribers, getSubscribedChannels, toggleSubscription };
