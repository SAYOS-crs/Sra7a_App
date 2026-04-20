import { UserModel } from "../../DB/index.js";
import { RollEnum } from "../../Utils/enums/Enums.js";
import { set } from "../../Utils/repository/radis.repository.js";
import {
  FindOne,
  FindOneAndUpdate,
  FindOneByIdAndUpdate,
} from "../../Utils/repository/repository.js";
import {
  BadRequstException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/responses/error.respons.js";
import { SuccessRespons } from "../../Utils/responses/success.respons.js";

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
      FreezedBy: Freeze_ID,
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
// -------------- Restore User --------------
export const RestoreUser = async (req, res) => {};
