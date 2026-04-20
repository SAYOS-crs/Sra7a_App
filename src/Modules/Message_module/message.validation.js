import joi from "joi";
import generalFilds from "../../Utils/validation/General_Filds.js";

export const SendmessageValidation = {
  body: joi.object({
    content: generalFilds.content.required(),
  }),
};
export const Authed_SendmessageValidation = {
  body: joi.object({
    content: generalFilds.content.required(),
  }),
};
export const GetmessageValidation = {
  params: joi.object({
    UserId: generalFilds.id,
  }),
};
export const GetSinglemessageValidation = {
  params: joi.object({
    messageID: generalFilds.id.required(),
  }),
};
