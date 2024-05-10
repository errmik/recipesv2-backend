import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.js";
import { LoginToken } from "../models/loginToken.js";
import { BadRequestError, UnauthorizedError, EmailError } from "../errors/customError.js";
import { sendLoginVerificationMail } from '../mail/mailer.js'
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator'

//TODO : rate limiting on all those controller
//implement lock account
//send email on password reset

const login = async (req, res) => {

    const { email } = req.body

    if (!email) {
        throw new BadRequestError('Please provide email')
    }

    let user = await User.findOne({ email }).exec();

    if (!user) {
        //User don't exist, create it
        //Create new user and assign a secret for OTP
        user = new User({
            email,
            sharedSecret: crypto.randomBytes(32).toString("hex")
        });
        await user.save()
    }

    //Delete all previously created login tokens
    await LoginToken.deleteMany({ user: user._id })

    //Create login token (OTP)
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

    const token = new LoginToken({
        user: user._id,
        token: otp,
    });
    await token.save();

    try {
        await sendLoginVerificationMail(user, otp);
    } catch (err) {
        throw new EmailError('Email could not be sent');
    }

    res.status(StatusCodes.OK).json({ msg: 'A verification email has been sent. Please verify your account.', name: user.name, email: user.email })
}

const verififyOtp = async (req, res) => {

    const { email, otp } = req.body

    if (!email || !otp) {
        throw new BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({ email }).exec();

    if (!user) {
        throw new UnauthorizedError('Invalid user')
    }

    const loginToken = await LoginToken.findOne({ user: user._id }).exec();

    if (!loginToken) {
        throw new UnauthorizedError('Invalid user/token')
    }

    if (loginToken.token !== otp) {
        throw new UnauthorizedError('Invalid password')
    }

    //Check expiration TODO

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    //Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    //Refresh token is sent in a http only cookie, so it should not be accessible from frontend js
    res.cookie(process.env.REFRESH_TOKEN_COOKIE || 'recipesJwtRefresh', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })

    //Access token is sent in json response. Storing it in the most secure way is the frontend responsability
    res.status(StatusCodes.OK).json({ userId: user._id, name: user.name, email: user.email, accessToken })
}

const refreshToken = async (req, res) => {

    if (!req.cookies?.jwt) {
        throw new UnauthorizedError('No refresh token');
    }

    var refreshToken = req.cookies.jwt;

    //console.log(refreshToken)

    //Check refresh token
    let payload

    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new BadRequestError('Invalid token')
    }

    const { userId, name, email } = payload;

    if (!userId || !name || !email) {
        throw new UnauthorizedError('Invalid token')
    }

    //Find user associated with token
    const user = await User.findById(userId).exec();

    if (!user) {
        throw new UnauthorizedError('Invalid token')
    }

    //Check user validity ? blocked ? verified ?

    //Check name and email too ? What if a user modifies his name/email ? Generate new tokens ?
    if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedError('Invalid token')
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
    res.status(StatusCodes.OK).json({ userId: user._id, name: user.name, email: user.email, accessToken })
}

const logOut = async (req, res) => {

    if (!req.cookies?.jwt) {
        //No cookie ? nothing to do
        return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    var refreshToken = req.cookies.jwt;

    let payload = '';

    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        //Invalid refresh token ? Clear cookies, and that's it
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    //Check refresh token
    const { userId, name, email } = payload;

    if (!userId) {
        //Invalid refresh token ? Clear cookies, and that's it
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    //Find user associated with token
    const user = await User.findById(userId).exec();

    if (!user) {
        //No user ? Clear cookies, and that's it
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    //What if a user modifies his name/email ? Generate new tokens ?
    if (user.refreshToken !== refreshToken) {
        //Strange case... Clear cookies, and that's it
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    //raz refresh token in database
    user.refreshToken = '';
    await user.save();

    //Clear cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    return res.sendStatus(StatusCodes.NO_CONTENT);
}

export { login, verififyOtp, refreshToken, logOut }