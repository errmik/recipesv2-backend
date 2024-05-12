import nodemailer from 'nodemailer'
import { EmailError } from "../errors/customError.js"
import { transformTemplate } from '../templates/templates.js';

var smtpConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // use SSL
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
};

const transporter = nodemailer.createTransport(smtpConfig);

//Check mail service connectivity
transporter.verify((err, success) => {
    if (err)
        throw new EmailError("Connexion to mail service failed")

    if (success)
        console.log('Connected to mail service');
});

//Generic mail sending function
const sendMail = async (mailOptions) => {

    //Apply mail from
    mailOptions.from = {
        name: process.env.MAIL_FROM_NAME,
        address: process.env.MAIL_FROM
    };

    try {
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        throw new EmailError('Email could not be sent')
    }

};

const sendLoginVerificationMail = async (user, otp) => {

    var result = await transformTemplate('./templates/loginVerification.html', { FirstName: user.name, OTP: otp })

    //Send verification email
    const mailOptions = {
        to: user.email,
        subject: 'Sign in request',
        text: `Your one time password : ${otp}`,
        html: result
    };

    await sendMail(mailOptions);
};

export { sendMail, sendLoginVerificationMail }