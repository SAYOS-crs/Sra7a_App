import { UserModel } from "../../DB/index.js";
import { set } from "../../Utils/repository/radis.repository.js";
import { FindOneByIdAndUpdate } from "../../Utils/repository/repository.js";
import { NotFoundException } from "../../Utils/responses/error.respons.js";
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
