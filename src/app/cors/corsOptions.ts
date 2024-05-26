import { StatusCodes } from "http-status-codes";
import { allowedOrigins } from "./allowedOrigins.js";

// const corsOptions = {
//   origin: (origin: string, callback) => {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: StatusCodes.OK,
// };

var corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: StatusCodes.OK, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export { corsOptions };
