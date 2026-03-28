import { GetSignature } from "./signature.service.js";
import { GeneratToken } from "./token.service.js";

export const GeneratCredentials = async (user) => {
  const signature = await GetSignature(user.Roll);
  //   -----------------------
  const RefreshToken = GeneratToken({
    payloud: user.id,
    signature: signature.RefreshSignature,
    options: {
      expiresIn: "7 days",
    },
  });
  // ---------------------------
  const AccessToken = GeneratToken({
    payloud: user.id,
    signature: signature.AccessSignature,
    options: {
      expiresIn: "2h",
    },
  });
  //   -----------------------
  return { RefreshToken, AccessToken };
};
