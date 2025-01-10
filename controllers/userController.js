import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";
import apiResponse from "../utils/apiResponse.js";
import bcrypt from "bcryptjs";
import getJwtToken from "../utils/getJwtToken.js";
import crypto from "crypto";
import Domain from "../models/domainModel.js";

export const register = catchAsyncError(async (req, res) => {
  const { name, email, password, accountType, accountId, role } = req.body;

  if (!name || !email || !password || !accountType || !accountId || !role) {
    return apiResponse(
      false,
      400,
      "Please provide all required fields",
      null,
      res
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    accountType,
    accountId,
  });
  user = user.toObject();
  delete user.password;
  getJwtToken(user, 201, res);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return apiResponse(
      false,
      400,
      "Please provide email and password",
      null,
      res
    );
  }

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return apiResponse(false, 401, "Invalid credentials", null, res);
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return apiResponse(false, 401, "Invalid credentials", null, res);
  }
  user = user.toObject();
  delete user.password;

  getJwtToken(user, 200, res);
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user.id).populate(
    "assignedDomain",
    "domain type"
  );
  user = user.toObject();
  delete user.password;
  return apiResponse(true, 200, "User profile", user, res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  return apiResponse(true, 200, "Logged out successfully", null, res);
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });
  if (!users) {
    return apiResponse(false, 404, "No users found", null, res);
  }
  return apiResponse(true, 200, "All users", users, res);
});

export const requestForAd = catchAsyncError(async (req, res, next) => {
  const { domainDesc } = req.body;
  const userId = req.user.id;
  if (!domainDesc) {
    return apiResponse(
      false,
      400,
      "Please provide all required fields",
      null,
      res
    );
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiResponse(false, 404, "User not found", null, res);
  }

  user.requestForAd = true;

  user.allRequestsForAd.push({
    requestForAdAt: Date.now(),
        domainDesc,
  });

  await user.save();
  return apiResponse(
    true,
    200,
    "Request for ads approval sent successfully",
    user,
    res
  );
});

export const getMyRequestsForAd = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("assignedDomain")
    .populate("allRequestsForAd.assignedDomain");

  if (!user) {
    return apiResponse(false, 404, "User not found", null, res);
  }
  return apiResponse(true, 200, "All requests for ads", user, res);
});

export const approveAdRequest = catchAsyncError(async (req, res, next) => {
  const { userId, requestId, domainId } = req.body;

  if (!userId || !requestId) {
    return apiResponse(
      false,
      400,
      "Please provide user id and request id",
      null,
      res
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    return apiResponse(false, 404, "User not found", null, res);
  }

  const domainRequest = user.allRequestsForAd.find(
    (req) => req._id.toString() === requestId
  );
  if (!domainRequest) {
    return apiResponse(false, 404, "Request not found", null, res);
  }

  function generateRandomToken(length = 32) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let token = "";

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      token += characters[array[i] % charactersLength];
    }

    return token;
  }

  const randomToken = generateRandomToken();

  domainRequest.approved = true;
  domainRequest.approvedAt = new Date(Date.now());
  domainRequest.assignedDomain = domainId;
  domainRequest.CId = randomToken;

  const domainUpdate = await Domain.findByIdAndUpdate(
    domainId,
    { assignedTo: userId, assignedDomainAt: domainRequest.approvedAt },
    { new: true }
  );

  if (!domainUpdate) {
    return apiResponse(false, 500, "Failed to assign domain", null, res);
  }

  await user.save();

  return apiResponse(true, 200, "Request approved successfully", user, res);
});

export const getAllRequestedDomains = catchAsyncError(
  async (req, res, next) => {
    const users = await User.find({ requestForAd: true });

    const allRequestsForAd = users.map((user) =>
      user.allRequestsForAd.filter((request) => request.approved === false)
    );
    if (!users) {
      return apiResponse(false, 404, "No users found", null, res);
    }
    return apiResponse(
      true,
      200,
      "All requested domains",
      allRequestsForAd,
      res
    );
  }
);

export const addAClick = catchAsyncError(async (req, res, next) => {
  const { cid, fingerprint, userAgent, timestamp, ipAddress, windowTabId } =
    req.body;

  if (
    !cid ||
    !fingerprint ||
    !userAgent ||
    !timestamp ||
    !ipAddress ||
    !windowTabId
  ) {
    return apiResponse(false, 400, "All fields are required", null, res);
  }
  const user = await User.findOne({ "allRequestsForAd.CId": cid });
  if (!user) {
    return apiResponse(false, 404, "User not found", null, res);
  }

  const request = user.allRequestsForAd.find((ad) => ad.CId === cid);
  if (!request) {
    return apiResponse(false, 404, "Request not found", null, res);
  }

  const existingClick = request.clickedFingerprints.find(
    (clickData) =>
      clickData.fingerprint === fingerprint ||
      clickData.userAgent === userAgent ||
      clickData.ipAddress === ipAddress
  );

  if (existingClick) {
    return apiResponse(
      false,
      400,
      "You have already clicked for this CID",
      null,
      res
    );
  }

  request.clickedFingerprints.push({
    fingerprint,
    userAgent,
    ipAddress,
    windowTabId,
    clickedAt: timestamp,
  });

  request.totalClicks = request.totalClicks ? request.totalClicks + 1 : 1;

  // Save the updated user data
  await user.save();

  const clickData = {
    cid,
    fingerprint,
    userAgent,
    timestamp,
    ipAddress,
    windowTabId,
    clickedAt: timestamp,
  };

  console.log("Click Data:", clickData);

  // Return success response
  return apiResponse(true, 200, "Click count updated successfully", user, res);
});
