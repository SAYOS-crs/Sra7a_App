import nodemailer from "nodemailer";
import { EMAIL_pass, EMAIL_user } from "../../../config/config.service.js";
import { EmailType } from "./email.subject.js";

export default async function SendEmail({
  to,
  subject = EmailType.WellcomeEmail,
  text = "",
  html = "",
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: EMAIL_user,
      pass: EMAIL_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: `"SAYOS" ${EMAIL_user}`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}
