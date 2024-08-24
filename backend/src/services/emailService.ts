import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const transporter = nodemailer.createTransport({
  host: "smtp.purelymail.com",
  port: process.env.NODE_ENV === "production" ? 465 : 587,
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.PURELYMAIL_USERNAME,
    pass: process.env.PURELYMAIL_PASSWORD,
  },
});

const logoPath = path.join(
  __dirname,
  "../../../frontend/src/assets/logo_expanded.png"
);
const logoBase64 = fs.readFileSync(logoPath).toString("base64");

const emailService = {
  sendVerificationEmail: async (email: string, code: string) => {
    const msg = {
      from: `"Veterinarycomp" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Veterinarycomp.com email verification",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email for VeterinaryComp</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .logo {
              display: block;
              margin: 0 auto 20px;
              max-width: 200px;
            }
            .verification-code {
              font-size: 24px;
              font-weight: bold;
              color: #4a4a4a;
              text-align: center;
              margin: 20px 0;
              padding: 10px;
              background-color: #f0f0f0;
              border-radius: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <h2>Welcome to Veterinarycomp.com</h2>
          <p>Thank you for signing up. To complete your registration, please use the verification code below:</p>
          <div class="verification-code">${code}</div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <img src="cid:logo" alt="VeterinaryComp Logo" class="logo">
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VeterinaryComp. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: "logo.png",
          content: logoBase64,
          encoding: "base64",
          cid: "logo",
        },
      ],
    };

    try {
      await transporter.sendMail(msg);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  },
};

export default emailService;
