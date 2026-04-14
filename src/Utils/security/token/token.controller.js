import {
  ACCESS_Token_Time,
  REFRESH_Token_Time,
} from "../../../../config/config.service.js";
import { GetSignature } from "./signature.service.js";
import { GeneratToken } from "./token.service.js";
import { v4 as uuidv4 } from "uuid";
export const GeneratCredentials = async (user) => {
  const signature = await GetSignature(user.Roll);
  //   -----------------------
  const RefreshToken = GeneratToken({
    payloud: user.id,
    signature: signature.RefreshSignature,
    options: {
      expiresIn: REFRESH_Token_Time,
      jwtid: uuidv4(),
    },
  });
  // ---------------------------
  const AccessToken = GeneratToken({
    payloud: user.id,
    signature: signature.AccessSignature,
    options: {
      expiresIn: ACCESS_Token_Time,
      jwtid: uuidv4(),
    },
  });
  //   -----------------------
  return { RefreshToken, AccessToken };
};
