import { EventEmitter } from "node:events";
import SendEmail from "./email.service.js";
import { EmailType } from "./email.subject.js";

export const EmailEvent = new EventEmitter();

EmailEvent.on(EmailType.ConfirmEmail, async (data) => {
  await SendEmail({
    to: data.to,
    subject: EmailType.ConfirmEmail,
    text: "",
    html: data.html,
  });
});

EmailEvent.on(EmailType.ForgetPasswrd, async (data) => {
  await SendEmail({
    to: data.to,
    subject: EmailType.ForgetPasswrd,
    text: "",
    html: data.html,
  });
});

EmailEvent.on(EmailType.WellcomeEmail, async (data) => {
  await SendEmail({
    to: data.to,
    subject: EmailType.WellcomeEmail,
    text: "",
    html: data.html,
  });
});

EmailEvent.on(EmailType.ResetPassword, async (data) => {
  await SendEmail({
    to: data.to,
    subject: EmailType.ResetPassword,
    text: "",
    html: data.html,
  });
});
