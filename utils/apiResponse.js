const apiResponse = (success, statusCode, message, data, res) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
export default apiResponse;
