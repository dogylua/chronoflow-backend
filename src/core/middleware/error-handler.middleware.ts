import { Request, Response, NextFunction } from "express";
import { AppError } from "../error/app-error";
import { Logger } from "@nestjs/common";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = new Logger("ErrorHandler");

  // Log the error
  logger.error(
    `Error occurred: ${err.message}`,
    err.stack,
    `Request URL: ${req.url}`,
    `Request Method: ${req.method}`,
    `Request Body: ${JSON.stringify(req.body)}`,
    `Request Headers: ${JSON.stringify(req.headers)}`
  );

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code || "APP_ERROR",
      message: err.message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: err.message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid token",
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      code: "TOKEN_EXPIRED",
      message: "Token expired",
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  // Handle database errors
  if (err.name === "SequelizeError" || err.name === "MongoError") {
    return res.status(500).json({
      status: "error",
      code: "DATABASE_ERROR",
      message: "Database error occurred",
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  // Handle TypeORM errors
  if (err.name === "QueryFailedError") {
    return res.status(500).json({
      status: "error",
      code: "DATABASE_ERROR",
      message: "Database query failed",
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  // Default error response
  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};
