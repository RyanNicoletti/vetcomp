import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { JobRecord } from "../../../shared-types/types";

interface JobPostConfirmationParams {
  email: string;
  jobDetails: JobRecord;
  subscriptionDetails: {
    amount: number;
    interval: string;
  };
}

const transporter = nodemailer.createTransport({
  host: "smtp.purelymail.com",
  port: process.env.NODE_ENV === "production" ? 465 : 587,
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.PURELYMAIL_USERNAME,
    pass: process.env.PURELYMAIL_PASSWORD,
  },
});

const logoPath = path.join(__dirname, "../../assets/logo_expanded.png");

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
          <p>Thanks for signing up to Veterinarycomp.com. To complete your registration, please use the verification code below:</p>
          <div class="verification-code">${code}</div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this verification, please ignore this email. If you are having trouble accessing your account, please contact our Support Team.</p>
          </br>
          <p>-The Veterinarycomp.com Team</p>
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

  sendPasswordResetEmail: async (email: string, resetLink: string) => {
    const msg = {
      from: `"Veterinarycomp" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Reset Your Veterinarycomp.com Password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password for VeterinaryComp</title>
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
            .reset-button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
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
          <h2>Reset Your Veterinarycomp.com Password</h2>
          <p>We received a request to reset your password for Veterinarycomp.com. If you didn't make this request, you can ignore this email.</p>
          <p>To reset your password, copy and paste this link into your browser:</p>
          <p>${resetLink}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you're having trouble, please contact us at support@veterinarycomp.com.</p>
          </br>
          <p>-The Veterinarycomp.com Team</p>
          <img src="cid:logo" alt="VeterinaryComp Logo" class="logo">
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Veterinarycomp.com All rights reserved.</p>
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
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  },
  sendJobPostConfirmationEmail: async ({
    email,
    jobDetails,
    subscriptionDetails,
  }: JobPostConfirmationParams) => {
    const msg = {
      from: `"Veterinarycomp" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Job Post Confirmation - VeterinaryComp",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Post Confirmation</title>
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
            .job-details {
              background-color: #f5f5f5;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .subscription-details {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <img src="cid:logo" alt="VeterinaryComp Logo" class="logo">
          
          <h2>Job Post Confirmation</h2>
          <p>Thank you for posting a job on VeterinaryComp! Your job post has been successfully created and is now live on our platform.</p>
          
          <div class="job-details">
            <h3>Job Details:</h3>
            <p><strong>Title:</strong> ${jobDetails.title}</p>
            <p><strong>Company:</strong> ${jobDetails.company}</p>
            <p><strong>Location:</strong> ${jobDetails.location}</p>
            <p><strong>Practice Type:</strong> ${jobDetails.practice_type}</p>
            <p><strong>Salary Range:</strong> $${jobDetails.salary_min.toLocaleString()} - $${jobDetails.salary_max.toLocaleString()}</p>
          </div>

          <div class="subscription-details">
            <p>Your subscription has been set up successfully:</p>
            <p>Amount: $${subscriptionDetails.amount}/month</p>
            <p>You can cancel your subscription at any time from your profile page.</p>
          </div>

          <p>If you need to make any changes to your job post or have any questions, please visit your profile page or contact our support team at support@veterinarycomp.com.</p>

          <p>Best regards,<br>The VeterinaryComp Team</p>
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
      console.error("Failed to send job post confirmation email:", error);
      throw new Error("Failed to send confirmation email");
    }
  },
};

export default emailService;
