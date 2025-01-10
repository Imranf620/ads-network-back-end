import jwt from "jsonwebtoken"
import apiResponse from "../utils/apiResponse.js";
import User from "../models/userModel.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return apiResponse(false, 401, "Please login to access this route", null, res);
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedData;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token has expired, please login again"
        : "Invalid token, please login again";
    return apiResponse(false, 401, message, null, res);
  }
};


export const isAdmin = async(req,res,next)=>{
    if(!req.user) {
        return apiResponse(false, 403, "You are not authorized to access this route", null, res);
    }
    const user = await User.findById(req.user.id);
    if(!user) {
        return apiResponse(false, 403, "You are not authorized to access this route", null, res);
    }
    if(user.role !== "admin") {
        return apiResponse(false, 403, "You are not authorized to access this route", null, res);
    }
    
    next();
}