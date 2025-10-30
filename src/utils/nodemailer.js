import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD ,
  },
}); 

const sendVerificationEmail = async (sendTo,code) => {
  let info = await transporter.sendMail({
    from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    to: sendTo,
    subject: "Verification Code",
    html: `<h1>Your verification code is: ${code}</h1>`
  });
}

module.exports = { sendVerificationEmail };