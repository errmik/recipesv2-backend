import { StatusCodes } from "http-status-codes";

class CustomError extends Error {
  errorCode: string = "";
  statusCode: number | null = null;
  constructor(message: string | undefined, code: string | null = null) {
    super(message);

    if (code) this.errorCode = code;
  }
}

class NotFoundError extends CustomError {
  constructor(message: string | undefined, code: string | null = null) {
    super(message, code);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

class BadRequestError extends CustomError {
  constructor(message: string | undefined, code: string | null = null) {
    super(message, code);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

class UnauthorizedError extends CustomError {
  constructor(message: string | undefined, code: string | null = null) {
    super(message, code);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

class ForbiddendError extends CustomError {
  constructor(message: string | undefined, code: string | null = null) {
    super(message, code);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

class EmailError extends CustomError {
  constructor(message: string | undefined, code: string | null = null) {
    super(message, code);
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
