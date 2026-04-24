import { UserModel } from "../../DB/index.js";
import { EmailType } from "../../Utils/email/email.subject.js";
import { RollEnum } from "../../Utils/enums/Enums.js";
import { set } from "../../Utils/repository/radis.repository.js";
import {
  FindOne,
  FindOneAndUpdate,
  FindOneByIdAndDelete,
  FindOneByIdAndUpdate,
} from "../../Utils/repository/repository.js";
import {
  BadRequstException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  unauthorizedexception,
} from "../../Utils/responses/error.respons.js";
import { SuccessRespons } from "../../Utils/responses/success.respons.js";
import { SendOTP, VerifyOTP } from "../../Utils/security/otp/otp.service.js";

export const GetProfile = async (req, res) => {
  // the req is holding new and object has {user  , decoded } data form the auth middleware
  const { user, decoded } = req;
  if (!user || !decoded) {
    throw NotFoundException({ message: "not found " });
  }
  return SuccessRespons({ res, massage: "done", data: { user, decoded } });
};

export const PatchPhoto = async (req, res) => {
  const result = await FindOneByIdAndUpdate({
    module: UserModel,
    id: req.user.id,
    data: { ProfilePictcher: req.file.RelativFilePath },
  });
  return SuccessRespons({ res, massage: "done", data: result });
};

// -------------- freez user --------------------
export const SuspendUser = async (req, res) => {
  // if the userid reseved form parames so its the admin trying to baan someone
  const { UserId } = req.params;
  if (UserId && req.user.Roll != RollEnum.Admin)
    throw ForbiddenException({ message: "Forbidden Action !" });
  // deside witch id  - the id that come from params must be first becz the req.user.id it will come anyway and if it come that mean freez it self
  const Freeze_ID = UserId ?? req.user.id;
  // baan the user
  const result = await FindOneAndUpdate({
    module: UserModel,
    // filter FreezedBy & FreezedAt must be not exists { cant baan user already got baaned }
    filter: {
      _id: Freeze_ID,
      FreezedBy: { $exists: false },
      FreezedAt: { $exists: false },
    },
    // update the FreezedBy & FreezedAt and unset the RestoredBy & RestoredAt becz the user may be got bannd and Restored before
    data: {
      FreezedBy: req.user.id,
      FreezedAt: Date.now(),
      $unset: {
        RestoredBy: true,
        RestoredAt: true,
      },
    },
  });

  if (!result) {
    throw BadRequstException({ message: "some thing went wrong ..." });
  }
  return SuccessRespons({
    res,
    massage: `Account Suspended Successfly ${UserId ? "id from params - (admin)" : "id form token - self suspend"}`,
  });
};
// -------------- Restore User by admin--------------
export const Admin_RestoreUser = async (req, res) => {
  const { UserId } = req.params;

  const user = await FindOneAndUpdate({
    module: UserModel,
    filter: {
      _id: UserId,
      FreezedBy: { $exists: true, $ne: req.user.id },
      FreezedAt: { $exists: true },
    },
    data: {
      RestoredAt: Date.now(),
      RestoredBy: req.user.id,
      $unset: {
        FreezedAt: true,
        FreezedBy: true,
      },
    },
  });
  if (!user) {
    throw NotFoundException({
      message: "User not found or its not Suspended to Restore it !",
    });
  }

  return SuccessRespons({
    res,
    massage: `Account Restored Successfly by Admin`,
  });
};
// ----
// ----
// ----
// --------------- Restore User by him self-----------------
export const Self_RestoreUser = async (req, res) => {
  const { Email } = req.body;
  // 1. search for user
  const user = await FindOne({
    module: UserModel,
    filter: {
      Email: Email,
      FreezedBy: { $exists: true },
      FreezedAt: { $exists: true },
    },
    options: {
      populate: "FreezedBy",
    },
  });
  // 2. check for user if exists
  if (!user) {
    throw NotFoundException({
      message: "User Not Found or you are not Suspended",
    });
  }

  // 3. check if it that same person who Freezed The Account ? if not so hi cant do this action
  // + if the FreezedBy not the user + it is admin = dniy it / that include the admin how got suspended by another admin
  if (user.FreezedBy.id !== user.id && user.FreezedBy.Roll === RollEnum.Admin) {
    throw unauthorizedexception({
      message:
        "Account Suspended by Admin , you dont have permation to excute this action ",
    });
  }

  // send otp
  await SendOTP({ Email, OTPtype: EmailType.RestoreAccount });
  return SuccessRespons({
    res,
    massage: "Check your Email for OTP",
  });
};
// --- unlock account
export const ReactivateUser = async (req, res) => {
  const { OTP, Email } = req.body;
  const user = await FindOne({
    module: UserModel,
    filter: {
      Email,
      FreezedBy: { $exists: true },
      FreezedAt: { $exists: true },
    },
  });
  if (!user) {
    throw NotFoundException({
      message: "User not found or the account not suspended",
    });
  }
  // 1. verify OTP
  await VerifyOTP({ Email, OTP });
  // 2. Restore the Account if is the same person who Suspend him self
  const result = await FindOneAndUpdate({
    module: UserModel,
    filter: { Email },
    data: {
      $unset: {
        FreezedAt: true,
        FreezedBy: true,
      },
      RestoredAt: Date.now(),
      RestoredBy: user._id,
    },
  });
  if (!result) {
    throw BadRequstException({ message: "Something Went Wrong ..." });
  }
  return SuccessRespons({
    res,
    massage: "Account Restored Successfly ",
    data: result,
  });
};
// ----
// ----
// --------------- Delete User by Admin
export const DeleteUser = async (req, res) => {
  const { UserId } = req.params;
  const DeletedUser = await FindOneByIdAndDelete({
    module: UserModel,
    id: UserId,
  });
  if (!DeletedUser) {
    throw NotFoundException({ message: "Not Found User" });
  }
  return SuccessRespons({
    res,
    massage: `User : ${UserId} , Has been Deleted Successfly`,
  });
};
