import mongoose from "mongoose";
import { UserModel } from "../DB/index.js";
import { SignatureRoll, SignatureType } from "../Utils/enums/Token.Enum.js";
import { FindOne } from "../Utils/repository/user.repository.js";
import { GetSignature } from "../Utils/security/token/signature.service.js";
import { VerifyToken } from "../Utils/security/token/token.service.js";
import { NotFoundException } from "../Utils/responses/error.respons.js";

export const decodeToken = async ({
  Authorization,
  TokenType = SignatureType.AccessToken,
}) => {
  // 0. distruct bearer and token form Authorization
  const [Bearer, token] = Authorization.split(" ") || [];
  // 1. get signature
  const signature = await GetSignature(
    Bearer === "User" ? SignatureRoll.user : SignatureRoll.Admin,
  );
  // 2. verify token
  const decoded = await VerifyToken({
    token,
    signature:
      TokenType === SignatureType.AccessToken
        ? signature.AccessSignature
        : signature.RefreshSignature,
  });
  // 3. find by id
  const user = await FindOne({
    module: UserModel,
    filter: { _id: decoded.id },
  });
  // 4. return user in req.user
  return { user, decoded };
};

export const Authentication = ({ TokenType = SignatureType.AccessToken }) => {
  return async (req, res, next) => {
    // 5. call back the decodeToken method and send in the prams Authorization from req and TokenType form the route calling
    const { user, decoded } = await decodeToken({
      Authorization: req.headers.authorization,
      TokenType,
    });
    if (!user) {
      throw NotFoundException({ message: "not found" });
    }
    // 6. Assign the decodeToken result into req object
    req.user = user;
    req.decoded = decoded;
    // 7. use next to pass the middleware
    next();
  };
};
