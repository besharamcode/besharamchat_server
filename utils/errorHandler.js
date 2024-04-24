export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  if (!err.statusCode || err.statusCode < 400) {
    statusCode = 500;
  }

  const errorMessage = err.message || "Internal Server Error";
  const errors = err.errors || [];
  console.log(err);
  res.status(statusCode).json({
    status: "error",
    statusCode,
    success: false,
    message: errorMessage,
    errors,
  });
};
