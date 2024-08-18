import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const emailService = {
  sendVerificationEmail: async (email: string, code: string) => {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM!,
      subject: "Verify Your Email for Veterinarycomp",
      html: `
        <h1>Welcome to VeterinaryComp!</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw new Error("Failed to send verification email");
    }
  },
};

export default emailService;
