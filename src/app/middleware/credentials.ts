import { allowedOrigins } from "../cors/allowedOrigins.js";
import { Request, Response, NextFunction } from "express";

const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};

export { credentials };
