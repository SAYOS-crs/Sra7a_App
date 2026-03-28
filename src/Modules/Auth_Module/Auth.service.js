import { UserModel } from "../../DB/index.js";
import {
  EncryptionService,
  HashingService,
  UserServices,
} from "../../Utils/index.js";
import { SuccessRespons } from "../../Utils/responses/success.respons.js";
import { ConflictException } from "../../Utils/responses/error.respons.js";
import { Compare } from "../../Utils/security/hash.service.js";
import { GeneratCredentials } from "../../Utils/security/token/token.controller.js";

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

// ----------------------------------------------
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
      massage: "Email already exist",
    });
  }
  data.Password = await HashingService.Hash(data.Password);
  data.Phone = await EncryptionService.Encrypt(data.Phone);

  const result = await UserServices.InsertOne({ module: UserModel, data });
  return SuccessRespons({ res, data: result });
};
