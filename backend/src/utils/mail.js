import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "YouTweet",
      link: "https://youtweetlink.com",
      logo: "https://res.cloudinary.com/dtkj9jye6/image/upload/v1751097016/samples/cloudinary-logo-vector.svg",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.youtweet@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.log(
      "Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file"
    );
    throw new Error(error.message);
  }
};

const emailVerificationMailgenContent = (username, verificationLink) => {
  return {
    body: {
      name: username,
      intro: "Welcome to YouTweet! We're very excited to have you on board.",
      action: {
        instructions:
          "To get started, please click here to verify your email address.",
        button: {
          color: "#22BC66",
          text: "Verify Your Email",
          link: verificationLink,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, and we'll be happy to help you.",
    },
  };
};

const forgotPasswordMailgenContent = (username, resetPasswordLink) => {
  return {
    body: {
      name: username,
      intro: "We received a request to reset the password for your account.",
      action: {
        instructions: "Click the button below to reset your password.",
        button: {
          color: "#22BC66",
          text: "Reset Your Password",
          link: resetPasswordLink,
        },
      },
      outro:
        "If you did not request a password reset, please ignore this email.",
    },
  };
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};
