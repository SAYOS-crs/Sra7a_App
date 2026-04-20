import joi from "joi";
import {
  GenderEnum,
  LogoutFlags,
  ProviderEnum,
  RollEnum,
} from "../../Utils/enums/Enums.js";
import generalFilds from "../../Utils/validation/General_Filds.js";

export const SignupSchema = {
  body: joi.object({
    FirstName: generalFilds.FirstName.required(),
    LastName: generalFilds.LastName.required(),
    Email: generalFilds.Email.required(),

    Password: generalFilds.Password.required(),
    ConfirmPassword: generalFilds.ConfirmPassword,

    Phone: generalFilds.Phone.required(),
    Gender: generalFilds.Gender,
    // Pictcher
    ProfilePictcher: generalFilds.ProfilePictcher,
    CoverPictchers: generalFilds.CoverPictchers,
    // Date
    ConfirmEmail: generalFilds.ConfirmEmail,
    ChangeCredentials: generalFilds.ChangeCredentials,
  }),
  headers: joi.object({}).unknown(true),
  params: joi.object({}).unknown(true),
};
export const LoginSchema = {
  body: joi.object({
    Email: generalFilds.Email.required(),
    Password: generalFilds.Password.required(),
  }),
  headers: joi.object({}).unknown(true),
  params: joi.object({}).unknown(true),
};
export const LogoutSchema = {
  body: joi
    .object({
      flag: joi
        .string()
        .required()
        .valid(...Object.values(LogoutFlags)),
    })
    .unknown(true),
};
// --------------- password endpint validation -----------------
// ---------- forget password
export const ForgetPasswordSchema = {
  body: joi.object({
    Email: generalFilds.Email.required(),
  }),
};
// --------- Reset Password
export const ResetPasswordSchema = {
  body: joi.object({
    Email: generalFilds.Email.required(),
    newPassword: generalFilds.Password.required(),
    ConfirmNewPassowrd: joi.ref("newPassword"),
    OTP: generalFilds.OTP.required(),
  }),
};
// ---------- update password
export const UpdatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFilds.Password.required(),
    NewPassword: generalFilds.Password.invalid(joi.ref("oldPassword")).messages(
      {
        "any.invalid": "new password cant be the same old one",
      },
    ),
    ConfirmNewPassword: joi.ref("NewPassword"),
  }),
};
