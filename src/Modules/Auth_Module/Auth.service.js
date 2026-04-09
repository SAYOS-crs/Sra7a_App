import { UserModel } from "../../DB/index.js";
import mongoose from "mongoose";
import {
  EncryptionService,
  HashingService,
  UserServices,
} from "../../Utils/index.js";
import { SuccessRespons } from "../../Utils/responses/success.respons.js";
import {
  BadRequstException,
  ConflictException,
} from "../../Utils/responses/error.respons.js";
import { Compare } from "../../Utils/security/hash.service.js";
import { GeneratCredentials } from "../../Utils/security/token/token.controller.js";
import { RenewRefrshAndAccessTokens } from "../../Utils/security/token/refreshToken.service.js";
import VerifyGoogleToken from "../../Utils/providers/Google.js";
import { FindOne, InsertOne } from "../../Utils/repository/repository.js";
import { ProviderEnum, RollEnum } from "../../Utils/enums/Enums.js";
// ------------------- login end point ---------------------------
export const Login = async (req, res) => {
  const { Email, Password } = req.body;
  const user = await UserServices.FindOne({
    module: UserModel,
    filter: { Email },
  });
  // password check
  const match = await Compare({
    data: Password,
    cipher: user?.Password ? user.Password : " ",
  });
  // =======================================================
  if (!user || !match) {
    throw ConflictException({ message: "invalid Email or Password " });
  }
  // =======================================================

  const result = await GeneratCredentials(user);
  // =======================================================

  return SuccessRespons({ res, data: result });
};
// ------------------- sign up end point---------------------------
export const SignUp = async (req, res) => {
  const data = req.body;
  const { Email } = data;
  const MatchedEmail = await UserServices.FindOne({
    module: UserModel,
    filter: { Email },
    select: "-_id",
  });
  if (MatchedEmail) {
    throw ConflictException({
      status: 409,
      message: "Email already exist",
    });
  }
  data.Password = await HashingService.Hash(data.Password);
  data.Phone = await EncryptionService.Encrypt(data.Phone);

  const result = await UserServices.InsertOne({ module: UserModel, data });
  return SuccessRespons({ res, data: result });
};
// ------------------- refresh token end point --------------------
export const refreshToken = async (req, res) => {
  // distruct the token and the bearer
  const result = await RenewRefrshAndAccessTokens(req.headers.authorization);
  return SuccessRespons({
    res,
    message: "token refreshed successfly",
    data: result,
  });
};
// ------------------ log in with google ------------------
export const Google_social_provider = async (req, res) => {
  // 1. get the idToken from requst
  const { token } = req.body;
  // 2. verify google token
  const { email, email_verified, given_name, family_name, picture } =
    await VerifyGoogleToken(token);
  if (!email_verified)
    BadRequstException({ message: "cant register with unverified Email" });
  // 3. check with email - if there account with this email so log in if there no match with this email so signup
  const user = await FindOne({ module: UserModel, filter: { Email: email } });
  console.log(user);
  // if user exist Log in
  if (user) {
    const Tokens = await GeneratCredentials(user);
    return SuccessRespons({
      res,
      message: "loged in Successfly with Google Account ",
      data: Tokens,
    });
  }
  // if user dose not exist sign up
  const result = await InsertOne({
    module: UserModel,
    data: {
      FirstName: given_name,
      LastName: family_name,
      Email: email,
      ProfilePictcher: picture,
      Roll: RollEnum.User,
      Providers: ProviderEnum.google,
    },
  });
  const Tokens = await GeneratCredentials(result);
  return SuccessRespons({
    res,
    message: "signed up with Google Account Successfly ",
    data: Tokens,
  });
};
