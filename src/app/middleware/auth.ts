import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/customError.js";
import { Request, Response, NextFunction } from "express";

//Move those interfaces in a dedicated module
// interface AuthentifiedRequest extends Request {
//   user: {
//     userId: string;
//     name: string;
//     email: string;
//   };
// }

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
}

//Auth middleware : checks for a valid Bearer token
const auth = async (req: Request, res: Response, next: NextFunction) => {
  //Check header
  const authHeader = (req.headers.authorization ||
    req.headers.Authorization) as string;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Unauthorized");
  }

  //Extract token
  const token = authHeader.split(" ")[1];

  try {
    //Check token
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    //Attach the tokenized user to the query
    req.user = {
      userId: payload.userId as string,
      name: payload.name,
      email: payload.email,
    };

    next();
  } catch (error) {
    throw new UnauthorizedError("Unauthorized");
  }
};

//TODO : check role middleware :

export { auth };
