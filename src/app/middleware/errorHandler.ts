import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/customError.js";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import errorCodes from "../constants/errorCodes.js";

const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //check type of err to return custom status and msg
  if (err instanceof CustomError)
    return res
      .status((err as CustomError).statusCode!)
      .json({ success: false, msg: err.message, code: err.errorCode });

  //Mongoose error : some fields cannot be validated
  if (err.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: Object.values((err as mongoose.Error.ValidationError).errors)
        .map((item) => item.message)
        .join(","),
      code: "TODO",
    });
  }

  //Mongoose error : duplicate value in a field
  if (
    err.name === "MongoError" &&
    (err as mongoose.mongo.MongoError).code === 11000
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: "Duplicate value", //`Duplicate value entered for ${Object.keys(err.keyValue)} field`,
      code: "TODO",
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    msg: "something went wrong",
    code: errorCodes.INTERNAL_ERROR,
  });
};

export { errorHandler };
