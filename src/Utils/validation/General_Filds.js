import joi from "joi";
import { GenderEnum, ProviderEnum, RollEnum } from "../enums/Enums.js";

const generalFilds = {
  FirstName: joi.string().alphanum().max(12).min(3).trim().messages({
    "any.required": "First Name is required",
    "string.max": "First Name must be less than 12 chars ",
    "string.min": "First Name must be more than 3 chars ",
    "string.alphanum":
      "FirstName must be alphanum  , Space and sympolis are not allowed",
  }),
  LastName: joi.string().alphanum().max(12).min(3).trim().messages({
    "any.required": "Last Name is required",
    "string.max": " Last Name must be less than 12 chars ",
    "string.min": "Last Name must be more than 3 chars",
  }),

  Email: joi
    .string()
    .max(50)
    .email({
      minDomainSegments: 1,
      maxDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),

  Password: joi.string().alphanum().min(5).max(30).messages({
    "any.required": "password is required",
    "string.max": "max char is 30",
    "string.min": "minmum char is 5",
  }),
  ConfirmPassword: joi.ref("Password"),

  Phone: joi.string().pattern(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/),

  Roll: joi.number().default(RollEnum.User),
  authorization: joi.string().required(),
  id: joi.string().length(24).alphanum(),
  Gender: joi
    .number()
    .valid(...Object.values(GenderEnum))
    .default(GenderEnum.Male),
  Providers: joi
    .number()
    .valid(...Object.values(ProviderEnum))
    .default(ProviderEnum.system),
  // Pictcher
  ProfilePictcher: joi.string(),
  CoverPictchers: joi.array().length(5),
  // Date
  ConfirmEmail: joi.boolean().default(false),
  ChangeCredentials: joi.date(),
  // ----------add ones
  OTP: joi
    .string()
    .length(6)
    .pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]+$/),
  // message filds
  content: joi.string().min(3).max(500).trim(),
};
export default generalFilds;
