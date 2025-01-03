import Domain from "../models/domainModel.js";
import apiResponse from "../utils/apiResponse.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";

export const createDomain = catchAsyncError(async (req, res) => {
  try {
    const { domain, type } = req.body;
    const domainExists = await Domain.findOne({ domain });
    if (domainExists) {
      return apiResponse(false, 400, "Domain already exists", null, res);
    }

    // Create the domain
    const domainModel = await Domain.create({
      domain,
      type,
      owner: "6772ce113d7e91563a30e0e7", // Use a hardcoded user ID or `req.user.id` if available
    });

    // Populate owner field
    await domainModel.populate("owner", "name email");


    // Send the response
    apiResponse(true, 201, "Domain created successfully", domainModel, res);
  } catch (error) {
    console.log(error);
    apiResponse(false, 500, "Server error", null, res); // Add proper error handling for API
  }
});

export const getAllDomains = catchAsyncError(async (req, res, next) => {
  const domains = await Domain.find()
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("referenceTo", "domain");
  apiResponse(true, 200, "All domains", domains, res);
});

export const getSingleDomain = catchAsyncError(async (req, res, next) => {
  const domain = await Domain.findById(req.params.id)
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("referenceTo", "domain");
  if (!domain) {
    return next(new Error("Domain not found"));
  }
  apiResponse(true, 200, "Domain", domain, res);
});

export const assignDomainToUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body;
  const domainId = req.params.id;
  if (!userId) {
    return apiResponse(false, 400, "Please provide a user id", null, res);
  }
  const assignedDomainAt = Date.now();

  const domain = await Domain.findByIdAndUpdate(
    domainId,
    { assignedTo: userId, assignedDomainAt },
    { new: true }
  )
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("referenceTo", "domain");

  const user = await User.findByIdAndUpdate(
    userId,
    { assignedDomain: req.params.id, assignedDomainAt },
    { new: true }
  );
  if (!domain) {
    return next(new Error("Domain not found"));
  }
  return apiResponse(true, 200, "Domain assigned successfully", domain, res);
});

export const refereDomain = catchAsyncError(async (req, res, next) => {
  const domain = await Domain.findByIdAndUpdate(
    req.params.id,
    { referenceTo: req.body.domainId },
    { new: true }
  )
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("referenceTo", "domain");
  if (!domain) {
    return apiResponse(false, 404, "Domain not found", null, res);
  }
  return apiResponse(true, 200, "Domain referenced successfully", domain, res);
});
