import { type ErrorRequestHandler } from "express";
import { AppError } from "./app-error.js";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  if (!(err instanceof AppError) || err.statusCode >= 500) {
    console.error(err);
  }

  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};