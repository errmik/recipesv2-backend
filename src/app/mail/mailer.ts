import nodemailer from "nodemailer";
import { EmailError } from "../errors/customError.js";
import { transformTemplate } from "../templates/templates.js";
import { Options } from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { IUser } from "../models/user.js";

var smtpConfig: SMTPTransport.Options = {
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT as string),
  secure: true, // use SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

//Check mail service connectivity
transporter.verify((err, success) => {
  if (err) throw new EmailError("Connexion to mail service failed");

  if (success) console.log("Connected to mail service");
});

//Generic mail sending function
const sendMail = async (mailOptions: Options) => {
  //Apply mail from
  mailOptions.from = {
    name: process.env.MAIL_FROM_NAME as string,
    address: process.env.MAIL_FROM as string,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new EmailError("Email could not be sent");
  }
};

const sendLoginVerificationMail = async (user: IUser, otp: string) => {
  var result = await transformTemplate("./templates/loginVerification.html", {
    FirstName: user.name,
    OTP: otp,
  });

  //Send verification email
  const mailOptions = {
    to: user.email,
    subject: "Sign in request",
    text: `Your one time password : ${otp}`,
    html: result,
  };

  await sendMail(mailOptions);
};

export { sendMail, sendLoginVerificationMail };
