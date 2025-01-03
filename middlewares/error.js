import apiResponse from "../utils/apiResponse.js";

export default async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    return apiResponse(false, 400, message, null, res);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((error) => error.message);
    return apiResponse(false, 400, message, null, res);
  }

  if (err.name === "JsonWebTokenError") {
    return apiResponse(false, 400, "Invalid token, please login again", null, res);
  }

  if (err.name === "TokenExpiredError") {
    return apiResponse(false, 400, "Token expired, please login again", null, res);
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    return apiResponse(false, 400, message, null, res);
  }

  res.status(err.statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
