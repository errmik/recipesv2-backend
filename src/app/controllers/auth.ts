import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { IUser, User } from "../models/user.js";
import { LoginToken } from "../models/loginToken.js";
import {
  BadRequestError,
  UnauthorizedError,
  EmailError,
} from "../errors/customError.js";
import { sendLoginVerificationMail } from "../mail/mailer.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import otpGenerator from "otp-generator";
import errorCodes from "../constants/errorCodes.js";

//TODO : rate limiting on all those controller
//implement lock account
//send email on password reset

const login = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError(
      "Please provide email",
      errorCodes.USER_NOT_FOUND
    );
  }

  let user = await User.findOne({ email }).exec();

  if (!user) {
    throw new BadRequestError("User not found", errorCodes.USER_NOT_FOUND);
  }

  await manageOtp(user);

  res.status(StatusCodes.OK).json({
    status: "mailsent",
    msg: "A verification email has been sent. Please verify your account.",
    name: user.name,
    email: user.email,
  });
};

const signup = async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    throw new BadRequestError("Please provide email");
  }

  if (!name) {
    throw new BadRequestError("Please provide name");
  }

  let user = await User.findOne({ email }).exec();

  if (user) {
    throw new BadRequestError("User already exists");
  }

  //User don't exist, create it
  //Create new user
  user = new User({
    email,
    name,
  });
  await user.save();

  await manageOtp(user);

  res.status(StatusCodes.OK).json({
    status: "mailsent",
    msg: "A verification email has been sent. Please verify your account.",
    name: user.name,
    email: user.email,
  });
};

const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw new UnauthorizedError("Invalid user");
  }

  const loginToken = await LoginToken.findOne({ user: user._id }).exec();

  if (!loginToken) {
    throw new UnauthorizedError("Invalid user/token");
  }

  if (loginToken.token !== otp) {
    throw new UnauthorizedError("Invalid password");
  }

  //Check expiration TODO

  const accessToken = user.createAccessToken();
  const refreshToken = user.createRefreshToken();

  //Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  //Refresh token is sent in a http only cookie, so it should not be accessible from frontend js
  // res.cookie(
  //   process.env.REFRESH_TOKEN_COOKIE || "recipesJwtRefresh",
  //   refreshToken,
  //   {
  //     httpOnly: true,
  //     sameSite: "none",
  //     secure: true,
  //     maxAge: 24 * 60 * 60 * 1000,
  //   }
  // );

  //Access token is sent in json response. Storing it in the most secure way is the frontend responsability
  res.status(StatusCodes.OK).json({
    userId: user._id,
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
  });
};

const refreshToken = async (req: Request, res: Response) => {
  if (!req.cookies?.jwt) {
    throw new UnauthorizedError("No refresh token");
  }

  var refreshToken = req.cookies.jwt;

  //console.log(refreshToken)

  //Check refresh token
  let payload: JwtPayload;

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;
  } catch (err) {
    throw new BadRequestError("Invalid token");
  }

  const { userId, name, email } = payload;

  if (!userId || !name || !email) {
    throw new UnauthorizedError("Invalid token");
  }

  //Find user associated with token
  const user = await User.findById(userId).exec();

  if (!user) {
    throw new UnauthorizedError("Invalid token");
  }

  //Check user validity ? blocked ? verified ?

  //Check name and email too ? What if a user modifies his name/email ? Generate new tokens ?
  if (user.refreshToken !== refreshToken) {
    throw new UnauthorizedError("Invalid token");
  }

  const accessToken = user.createAccessToken();

  //Renew the refresh token.
  //TODO : check if the cookie is not sent twice. If so, delete cookie first
  // const refreshToken = user.createRefreshToken();

  // //Save refresh token in database
  // user.refreshToken = refreshToken;
  // await user.save();

  // //Refresh token is sent in a http only cookie, so it should not be accessible from frontend js
  //// Clearing the cookie
  //res.clearCookie('title');
  // res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })

  //Access token is sent in json response. Storing it in the most secure way is the frontend responsability
  res.status(StatusCodes.OK).json({
    userId: user._id,
    name: user.name,
    email: user.email,
    accessToken,
  });
};

const logOut = async (req: Request, res: Response) => {
  if (!req.cookies?.jwt) {
    //No cookie ? nothing to do
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  var refreshToken = req.cookies.jwt;

  let payload: JwtPayload;

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;
  } catch (error) {
    //Invalid refresh token ? Clear cookies, and that's it
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  //Check refresh token
  const { userId, name, email } = payload;

  if (!userId) {
    //Invalid refresh token ? Clear cookies, and that's it
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  //Find user associated with token
  const user = await User.findById(userId).exec();

  if (!user) {
    //No user ? Clear cookies, and that's it
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  //What if a user modifies his name/email ? Generate new tokens ?
  if (user.refreshToken !== refreshToken) {
    //Strange case... Clear cookies, and that's it
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  //raz refresh token in database
  user.refreshToken = "";
  await user.save();

  //Clear cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  return res.sendStatus(StatusCodes.NO_CONTENT);
};

//Not exported utils
const manageOtp = async (user: IUser) => {
  //Delete all previously created login tokens, just in case
  await LoginToken.deleteMany({ user: user._id });

  //Create login token (OTP)
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const token = new LoginToken({
    user: user._id,
    token: otp,
  });
  await token.save();

  try {
    await sendLoginVerificationMail(user, otp);
  } catch (err) {
    throw new EmailError("Email could not be sent");
  }
};

export { login, signup, verifyOtp, refreshToken, logOut };
