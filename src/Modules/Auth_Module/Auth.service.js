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
  ForbiddenException,
  NotFoundException,
} from "../../Utils/responses/error.respons.js";
import { Compare } from "../../Utils/security/hash.service.js";
import { GeneratCredentials } from "../../Utils/security/token/token.controller.js";
import { RenewRefrshAndAccessTokens } from "../../Utils/security/token/refreshToken.service.js";
import VerifyGoogleToken from "../../Utils/providers/Google.js";
import {
  FindOne,
  FindOneAndUpdate,
  FindOneByIdAndUpdate,
  InsertOne,
} from "../../Utils/repository/repository.js";
import {
  LogoutFlags,
  ProviderEnum,
  RollEnum,
} from "../../Utils/enums/Enums.js";
import TokenModel from "../../DB/Models/token_model.js";
import {
  del,
  Hget_all,
  Hset,
  RedisKeyPrefix,
  RedisOTPprefix,
  RedisUserCredentials,
  set,
} from "../../Utils/repository/radis.repository.js";
import { ACCESS_Token_Time, OTP_TTL } from "../../../config/config.service.js";
import {
  GenerateOTP,
  SendOTP,
  VerifyOTP,
} from "../../Utils/security/otp/otp.service.js";
import { EmailEvent } from "../../Utils/email/email.Event.js";
import { EmailType } from "../../Utils/email/email.subject.js";
import OTP_Templet from "../../Utils/email/email.templet.js";
// ------------------- login end point ---------------------------
export const Login = async (req, res) => {
  const { Email, Password } = req.body;
  const user = await UserServices.FindOne({
    module: UserModel,
    filter: { Email },
  });
  if (user?.FreezedAt) ForbiddenException({ message: "Account Suspended !" });
  if (!user?.ConfirmEmail) {
    throw BadRequstException({ message: "Email not Verifyed" });
  }
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
  });

  if (MatchedEmail) {
    throw ConflictException({
      status: 409,
      message: "Email already exist",
    });
  }

  data.Password = await HashingService.Hash(data.Password);
  data.Phone = await EncryptionService.Encrypt(data.Phone);

  // send otp
  await SendOTP({ Email, OTPtype: EmailType.ConfirmEmail });

  const result = await UserServices.InsertOne({ module: UserModel, data });

  return SuccessRespons({
    res,
    massage: "check your Email for Confirmation Code",
    data: result,
  });
};
// --------------------- Logout ------------------------------
export const Logout = async (req, res) => {
  const { flag } = req.body;
  let status;

  switch (flag) {
    case LogoutFlags.logout:
      await InsertOne({
        module: TokenModel,
        data: {
          jti: req.decoded.jti,
          userId: req.user.id,
          expirIn: req.decoded.exp * 1000,
        },
      });
      status = 201;
      break;
    case LogoutFlags.logoutFromAll:
      await FindOneByIdAndUpdate({
        module: UserModel,
        id: req.user.id,
        data: { ChangeCredentials: Date.now() },
      });
      status = 200;
      break;
  }
  return SuccessRespons({ res, status, massage: "User Loged out successfly" });
};
// ---------------------- Redis Logout ----------------------
export const Logout_Redis = async (req, res) => {
  const { flag } = req.body;
  let status;

  switch (flag) {
    case LogoutFlags.logout:
      const IsRevoced = await set({
        key: RedisKeyPrefix({ userId: req.user.id, jti: req.decoded.jti }),
        value: req.decoded.jti,
        ttl: 2 * 60 * 60,
      });
      if (!IsRevoced) {
        throw BadRequstException({
          message: "Error while seting the revoked token in redis",
        });
      }
      status = 201;
      break;
    case LogoutFlags.logoutFromAll:
      const RevokeByTime = await set({
        key: RedisUserCredentials({ userId: req.user.id }),
        value: Date.now(),
        ttl: 60 * 60,
      });
      if (!RevokeByTime) {
        throw BadRequstException({
          message:
            "Error while seting the revoked token by Credentials in redis ",
        });
      }
      status = 200;
      break;
  }
  return SuccessRespons({ res, status, massage: "User Loged out successfly" });
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
// ------------------- confirm Email --------------------
export const ConfirmEmail = async (req, res) => {
  const { Email, OTP } = req.body;

  const { CipherOTP, resendCount } = await VerifyOTP({ Email, OTP });

  const result = await FindOneAndUpdate({
    module: UserModel,
    filter: { Email, ConfirmEmail: { $exists: true, $eq: false } },
    data: { ConfirmEmail: true },
  });

  if (!result) {
    throw BadRequstException({
      message: "Something Went Wrong , try agin later ... ",
    });
  }
  SuccessRespons({ res, massage: "Email Confirmed Successfly" });
};
// ----------- Resend OTP (limit 3 times ) -------------
export const ResendOTP = async (req, res) => {
  const { Email } = req.body;
  // 1. check for user if exist and ConfirmEmail is false
  const user = await FindOne({
    module: UserModel,
    filter: { Email, ConfirmEmail: { $exists: true, $eq: false } },
  });
  if (!user) throw NotFoundException({ message: "invalid email" });

  // 2. check for resend trys remaining
  const data = await Hget_all({ key: RedisOTPprefix({ Email }) });
  // if ther no otp in redis > taht mean the user want to confirm after the ttl of otp has expired
  if (!data) {
    await SendOTP({ Email, OTPtype: EmailType.ConfirmEmail });
    return SuccessRespons({
      res,
      massage: `OTP has been send , check your Email`,
    });
  }
  const resendCount = Number(data.resendCount);

  // 3. check of Resend count
  if (resendCount == 0)
    throw BadRequstException({
      message: "you have Reached the max resend attempt , try after 30m ",
    });

  // 4. send otp and Decremnt the Resend by 1
  await SendOTP({
    Email,
    OTPtype: EmailType.ConfirmEmail,
    resendCount: resendCount - 1,
  });

  return SuccessRespons({
    res,
    massage: `OTP Has ben Resend , You have ${resendCount} resend attempt remaining.`,
  });
};
// ------------------- forget password -------------------
export const ForgetPassword = async (req, res) => {
  const { Email } = req.body;
  const user = await FindOne({ module: UserModel, filter: { Email } });
  if (!user) throw NotFoundException({ message: "Invalid Email" });
  await SendOTP({ Email, OTPtype: EmailType.ForgetPasswrd });
  return SuccessRespons({
    res,
    massage: "OTP has been send , check your Email",
  });
};
// ------------------- Reset Password -----------------
export const ResetPassword = async (req, res) => {
  const { OTP, newPassword, ConfirmNewPassowrd, Email } = req.body;
  // 1. verify OTP
  await VerifyOTP({ Email, OTP });
  // 2. hash the new password
  const CipherNewPassword = await HashingService.Hash(newPassword);
  const CipherConfirmNewPassowrd =
    await HashingService.Hash(ConfirmNewPassowrd);
  // 3. replace the old password
  const result = await FindOneAndUpdate({
    module: UserModel,
    filter: { Email, ConfirmEmail: true },
    data: {
      Password: CipherNewPassword,
      ConfirmPassword: CipherConfirmNewPassowrd,
    },
  });
  return SuccessRespons({
    res,
    massage: "Password reset Successfly",
    data: result,
  });
};
// ------------------ update password -------------
export const UpdatePassword = async (req, res) => {
  const { oldPassword, NewPassword, ConfirmNewPassword } = req.body;
  // 1. get the old password and compare it
  const CompareResult = await HashingService.Compare({
    data: oldPassword,
    cipher: req.user.Password,
  });
  if (!CompareResult) {
    throw ConflictException({ message: "The old-password does not match" });
  }
  // 2. hash the new password
  const CipherNewPassword = await HashingService.Hash(NewPassword);
  const CipherConfirmNewPassword =
    await HashingService.Hash(ConfirmNewPassword);
  // 3. update the password
  const result = await FindOneByIdAndUpdate({
    module: UserModel,
    id: req.user.id,
    data: {
      Password: CipherNewPassword,
      ConfirmPassword: CipherConfirmNewPassword,
    },
  });
  if (!result) {
    throw BadRequstException({ message: "error while updating password" });
  }

  return SuccessRespons({
    res,
    massage: "Password Updated Successfly",
    data: result,
  });
};
