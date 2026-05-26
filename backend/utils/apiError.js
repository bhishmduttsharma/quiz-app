export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const badRequest = (message, details = null) =>
  new ApiError(400, message, details);

export const unauthorized = (message = "Not authorized") =>
  new ApiError(401, message);

export const forbidden = (message = "Access denied") =>
  new ApiError(403, message);

export const notFound = (resource = "Resource") =>
  new ApiError(404, `${resource} not found`);
