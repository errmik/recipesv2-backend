import { StatusCodes } from "http-status-codes";

class CustomError extends Error {
  errorCode = "";
  constructor(message, code) {
    super(message);

    if (code) this.errorCode = code;
  }
}

class NotFoundError extends CustomError {
  constructor(message, code) {
    super(message, code);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

class BadRequestError extends CustomError {
  constructor(message, code) {
    super(message, code);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

class UnauthorizedError extends CustomError {
  constructor(message, code) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

class ForbiddendError extends CustomError {
  constructor(message, code) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

class EmailError extends CustomError {
  constructor(message, code) {
    super(message);
    this.statusCode = StatusCodes.BAD_GATEWAY;
  }
}

export {
  CustomError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddendError,
  EmailError,
};
