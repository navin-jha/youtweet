import {
  ApiError,
  ApiResponse,
  asyncHandler,
  emailVerificationMailgenContent,
  sendEmail,
  uploadOnCloudinary,
} from "../utils/index.js";
import { User } from "../models/user.model.js";

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

  let avatar = null;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatar = await uploadOnCloudinary(req.files.avatar[0].path);
  } else {
    throw new ApiError(400, "Avatar file is required");
  }

  let coverImage = null;
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
    avatar,
    coverImage,
    password,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  await sendEmail({
    email: createdUser.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      createdUser.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`
    ),
  });

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

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User with username or email does not exist");
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

export { registerUser, loginUser };
