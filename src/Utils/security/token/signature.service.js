import {
  ACCESS_ADMIN_SIGNATURE,
  ACCESS_USER_SIGNATURE,
  REFRESH_ADMIN_SIGNATURE,
  REFRESH_USER_SIGNATURE,
} from "../../../../config/config.service.js";
import { SignatureRoll } from "../../enums/Token.Enum.js";

export const GetSignature = (SignatureLevel) => {
  let signature = { RefreshSignature: undefined, AccessSignature: undefined };
  switch (SignatureLevel) {
    case SignatureRoll.Admin:
      signature.AccessSignature = ACCESS_ADMIN_SIGNATURE;
      signature.RefreshSignature = REFRESH_ADMIN_SIGNATURE;
      break;
    case SignatureRoll.user:
      signature.AccessSignature = ACCESS_USER_SIGNATURE;
      signature.RefreshSignature = REFRESH_USER_SIGNATURE;
      break;
  }
  return signature;
};
