import Domain from "../models/domainModel.js";
import apiResponse from "../utils/apiResponse.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";

export const createDomain = catchAsyncError(async (req, res) => {
  try {
    const { domain, type } = req.body;
    if (!domain || !type) {
      return apiResponse(
        false,
        400,
        "Please provide all required fields",
        null,
        res
      );
    }
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
    apiResponse(false, 500, "Server error", null, res);
  }
});

export const getAllDomains = catchAsyncError(async (req, res, next) => {
  const domains = await Domain.find().sort({ createdAt: -1 })
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("referenceTo", "domain")
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

export const getAllRedirectDomains = catchAsyncError(async (req, res, next) => {
  const domains = await Domain.find({ type: "redirect" })
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("referenceTo", "domain");
  apiResponse(true, 200, "All redirect domains", domains, res);
});

export const getAllTemplateDomains = catchAsyncError(async (req, res, next) => {
  const domains = await Domain.find({ type: "template" })
  apiResponse(true, 200, "All template domains", domains, res);
})

export const getButtonDomain = catchAsyncError(async (req, res, next) => {
  let { host } = req.body;

  const httpsHost = host.startsWith("https://") ? host : `https://${host}`;
  const httpHost = host.startsWith("http://") ? host : `http://${host}`;
  const plainHost = host.replace(/^https?:\/\//i, ""); 

  const domainExists = await Domain.findOne({
    $or: [
      { domain: httpsHost },
      { domain: httpHost },
      { domain: plainHost }
    ],
  });

  if (domainExists) {
    return res.status(200).json({ success: true, domain: domainExists });
  }

  return res.status(404).json({ success: false, message: "Domain not found" });
});


export const deleteDomain = catchAsyncError(async(req,res,next)=>{
  const domain = await Domain.findByIdAndDelete(req.params.id);
  if(!domain){
    return apiResponse(false, 404, "Domain not found", null, res)
  }
  return apiResponse(true, 200, "Domain deleted successfully", null, res);
})

export const toggleBtnRedirect = catchAsyncError(async (req, res, next) => {
 
  const domain = await Domain.findById(req.params.id);
  
  if (!domain) {
    return apiResponse(false, 404, "Domain not found", null, res);
  }

  domain.templateActive = !domain.templateActive;
  
  await domain.save();

  return apiResponse(true, 200, `Redirect ${domain.templateActive?"On":"Off"} successfully`, domain, res);
});
