import {
  ApiError,
  ApiResponse,
  asyncHandler,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  removeFromCloudinary,
  sendEmail,
  uploadOnCloudinary,
} from "../utils/index.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  let avatar;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatar = await uploadOnCloudinary(req.files.avatar[0].path);
  } else {
    throw new ApiError(400, "Avatar file is required");
  }

  let coverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
  }

  const user = await User.create({
    fullname,
    username,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
    password,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // await sendEmail({
  //   email: createdUser.email,
  //   subject: "Please verify your email",
  //   mailgenContent: emailVerificationMailgenContent(
  //     createdUser.username,
  //     `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`
  //   ),
  // });
  console.log(unHashedToken);

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User registered successfully and verification email has been sent on user's email"
      )
    );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { usernameOrEmail } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User with username or email does not exists");
  } else if (existedUser.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    existedUser.generateTemporaryToken();

  existedUser.emailVerificationToken = hashedToken;
  existedUser.emailVerificationExpiry = tokenExpiry;

  await existedUser.save({ validateBeforeSave: false });

  if (
    !existedUser.emailVerificationToken &&
    !existedUser.emailVerificationExpiry
  ) {
    throw new ApiError(
      500,
      "Something went wrong while updating email verification token"
    );
  }

  // await sendEmail({
  //   email: existedUser.email,
  //   subject: "Please verify your email",
  //   mailgenContent: emailVerificationMailgenContent(
  //     existedUser.username,
  //     `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`
  //   ),
  // });
  console.log(unHashedToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Email verification mail send successfully" },
        "Mail has been sent to your email Id"
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const existedUser = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!existedUser) {
    throw new ApiError(400, "Verification token is invalid or expired");
  }

  existedUser.isEmailVerified = true;
  existedUser.emailVerificationToken = undefined;
  existedUser.emailVerificationExpiry = undefined;

  await existedUser.save({ validateBeforeSave: false });

  if (!existedUser.isEmailVerified) {
    throw new ApiError(
      500,
      "Something went wrong while updating email verified status"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: existedUser.isEmailVerified,
        message: "Email is verified",
      },
      "Email verified successfully"
    )
  );
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { usernameOrEmail } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!existedUser) {
    throw new ApiError(400, "User with username or email does not exists");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    existedUser.generateTemporaryToken();

  existedUser.forgotPasswordToken = hashedToken;
  existedUser.forgotPasswordExpiry = tokenExpiry;

  await existedUser.save({ validateBeforeSave: false });

  if (!existedUser.forgotPasswordToken && !existedUser.forgotPasswordExpiry) {
    throw new ApiError(
      500,
      "Something went wrong while updating forgot password token"
    );
  }

  await sendEmail({
    email: existedUser.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      existedUser.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Password reset mail send successfully" },
        "Mail has been sent to your email Id"
      )
    );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  if (!resetToken) {
    throw new ApiError(400, "Password reset token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const existedUser = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!existedUser) {
    throw new ApiError(404, "Reset token is invalid or expired");
  }

  existedUser.password = newPassword;
  existedUser.forgotPasswordToken = undefined;
  existedUser.forgotPasswordExpiry = undefined;

  await existedUser.save({ validateBeforeSave: false });

  const isPasswordUpdate = await existedUser.isPasswordCorrect(newPassword);

  if (!isPasswordUpdate) {
    throw new ApiError(500, "Something went wrong while updating password");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "New password saved successfully" },
        "Password reset successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User with username or email does not exists");
  }

  const isPasswordCorrect = await existedUser.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(405, "Incorrect password");
  } else if (!existedUser.isEmailVerified) {
    throw new ApiError(
      409,
      "You need to verify your email first! If you don't receive the verification email, please click on resend verification email"
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken: accessToken },
        "User logged in successfully"
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const channel = await User.aggregate([
    {
      $match: { username },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        isSubscribed: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    } else if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: accessToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  const isPasswordUpdate = await user.isPasswordCorrect(newPassword);

  if (!isPasswordUpdate) {
    throw new ApiError(500, "Something went wrong while updating old password");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "New password saved successfully" },
        "Password changed successfully"
      )
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  let avatar;
  if (req.file?.path) {
    avatar = await uploadOnCloudinary(req.file.path);
  } else {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  await removeFromCloudinary(req.user.avatar, "image");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  let coverImage;
  if (req.file?.path) {
    coverImage = await uploadOnCloudinary(req.file.path);
  } else {
    throw new ApiError(400, "Cover image file is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (req.user.coverImage) {
    await removeFromCloudinary(req.user.coverImage, "image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, username } = req.body;

  if (username) {
    const existedUser = await User.findOne({ username });
    if (existedUser) {
      throw new ApiError(402, "User with username already exists");
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullname: fullname, username: username },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  await removeFromCloudinary(req.user.avatar, "image");
  if (req.user.coverImage) {
    await removeFromCloudinary(req.user.coverImage, "image");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  registerUser,
  resendEmailVerification,
  verifyEmail,
  forgotPasswordRequest,
  resetForgotPassword,
  loginUser,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  refreshAccessToken,
  changeCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  logoutUser,
  deleteUser,
};
