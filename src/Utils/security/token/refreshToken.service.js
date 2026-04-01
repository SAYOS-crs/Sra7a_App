import { UserModel } from "../../../DB/index.js";
import { SignatureRoll } from "../../enums/Token.Enum.js";
import { FindOne } from "../../repository/user.repository.js";
import {
  BadRequstException,
  NotFoundException,
} from "../../responses/error.respons.js";
import { GetSignature } from "./signature.service.js";
import { GeneratCredentials } from "./token.controller.js";
import { VerifyToken } from "./token.service.js";

export const RenewRefrshAndAccessTokens = async (authorization) => {
  const [Bearer, token] = authorization.split(" ");

  if (Bearer != "User" && Bearer != "Admin")
    BadRequstException({ extra: "Bearer must be User or Admin" });
  if (!token) BadRequstException({ message: " token is required " });
  // get the signature depind on roll

  const signature = await GetSignature(
    Bearer == "User" ? SignatureRoll.user : SignatureRoll.Admin,
  );
  // verify the refresh-token
  const decodedToken = await VerifyToken({
    token,
    signature: signature.RefreshSignature,
  });
  // check the user
  const user = await FindOne({
    module: UserModel,
    filter: { _id: decodedToken.id },
  });
  if (!user) throw NotFoundException({ message: "user not found" });
  // create new Creadentials

  return await GeneratCredentials(user);
};
