import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError, asyncHandler } from "../utils/index.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const incomingAccessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!incomingAccessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingAccessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Access token is invalid or expired");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default verifyJWT;
