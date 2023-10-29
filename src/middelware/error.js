import mongoose from "mongoose";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import { envConfig } from "../config/env.config.js";
export const errorConverter = async (error, req, res, next) => {
  console.log("error", error);
  // let newError:
  const errorClass = [
    {
      class: mongoose.Error,
      statusCode: httpStatus.BAD_REQUEST,
    },
    {
      class: jwt.JsonWebTokenError,
      statusCode: httpStatus.FORBIDDEN,
    },
  ];
  if (!(error instanceof ApiError)) {
    let statusCode;
    if ("statusCode" in error) {
      statusCode = error.statusCode;
    } else {
      for (let i = 0; i < errorClass.length; i++) {
        if (error instanceof errorClass[i].class) {
          statusCode = errorClass[i].statusCode;
          break;
        }
      }
      if (!statusCode) statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }
    console.log("---------statusCode", statusCode);
    const message = error.message;
    error = new ApiError(statusCode, message, error.stack);
  }
  next(error);
};

export const errorHandler = async (error, req, res, next) => {
  const { statusCode, message } = error;
  return res.status(statusCode).send({
    code: statusCode,
    message,
    ...(envConfig.env === "development " && { stack: error.stack }),
  });
};
