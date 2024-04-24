export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "", success) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.stack = stack || new Error().stack;
  }
}
