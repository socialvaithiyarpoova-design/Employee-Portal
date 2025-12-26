require("dotenv").config();
const nodemailer = require("nodemailer");
const templates = require("./template");
const { mailSecrets } = require("../utilities/vaultClient");

// Send Email Function
const sendEmail = async (email, payload) => {
  try {
     const mailCreds = await mailSecrets();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: mailCreds.MAIL_HOST || "smtp.gmail.com",
      port: mailCreds.MAIL_PORT|| 587,
      secure: false, 
      auth: {
        user: mailCreds.MAIL_USER,
        pass: mailCreds.MAIL_PASS,
      },
    });

    if (!templates[payload.template]) {
      throw new Error("Invalid email template");
    }
    const emailContent = templates[payload.template]({payload});
    // Email options
    const mailOptions = {
      from: `${mailCreds.FROM_EMAIL} <${mailCreds.MAIL_USER}>`,
      to: email,
      ...emailContent
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return "Email sent successfully";
    
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = { sendEmail };