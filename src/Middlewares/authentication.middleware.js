import mongoose from "mongoose";
import { UserModel } from "../DB/index.js";
import { SignatureRoll, SignatureType } from "../Utils/enums/Token.Enum.js";
import { FindOne } from "../Utils/repository/repository.js";
import { GetSignature } from "../Utils/security/token/signature.service.js";
import { VerifyToken } from "../Utils/security/token/token.service.js";
import {
  NotFoundException,
  unauthorizedexception,
} from "../Utils/responses/error.respons.js";
import TokenModel from "../DB/Models/token_model.js";
import {
  get,
  RedisKeyPrefix,
  RedisUserCredentials,
} from "../Utils/repository/radis.repository.js";
import CheckRevokedTokenInAllDevices from "../Utils/security/token/revokeToken.service.js";

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

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -- search if the token is revoked ( mongoose )
  const isTokenRevoked = await FindOne({
    module: TokenModel,
    filter: { jti: decoded.jti },
  });
  if (isTokenRevoked) {
    throw unauthorizedexception({ message: "Token is Revoked (mongoose)" });
  }
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------  3. find by id---------------------------
  const user = await FindOne({
    module: UserModel,
    filter: { _id: decoded.id, ConfirmEmail: true },
  });
  // --------------------check for if the user suspended--------
  if (user.FreezedAt) {
    throw unauthorizedexception({ message: "Account Suspended" });
  }
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -- search if the token is revoked ( redis ) ----------------
  if (
    await get({
      key: RedisKeyPrefix({ userId: user.id, jti: decoded.jti }),
    })
  ) {
    throw unauthorizedexception({ message: "Token is Revoked (redis)" });
  }
  // -------------------------------------------------------------
  // --------------------- mongose Credentials check -----------------
  // check if the token time is before the ChangeCredentials or after
  // after = meen the token created after the ChangeCredentials has ben set / updated > valid token
  // before = meen the token created before the ChangeCredentials has set > invalid token
  if (
    CheckRevokedTokenInAllDevices({
      credentialsTime: user.ChangeCredentials,
      iat: decoded.iat,
    })
  ) {
    throw unauthorizedexception({
      message: "Credentials Time not matches the iat of token (mongoose)",
    });
  }
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // ------------------- Redis Credentials check ------------------
  // check if the token time is before the ChangeCredentials or after
  // after = meen the token created after the ChangeCredentials has ben set / updated > valid token
  // before = meen the token created before the ChangeCredentials has set > invalid token
  // ttl = accesstoken exp
  const Redis_CredentialsTime = await get({
    key: RedisUserCredentials({ userId: user.id }),
  });
  if (
    CheckRevokedTokenInAllDevices({
      credentialsTime: Redis_CredentialsTime,
      iat: decoded.iat,
    })
  ) {
    throw unauthorizedexception({
      message: "Credentials Time not matches the iat of token (Redis)",
    });
  }
  // -------------------------------------------------------------
  // -------------------------------------------------------------
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
