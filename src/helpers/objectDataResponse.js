const customResponse = (res, statusCode, data, message) => {
  const isError = statusCode >= 400;
  return res.status(statusCode).json({
    success: !isError,
    error: isError,
    message: message,
    data: data,
  });
};

module.exports = { customResponse };
