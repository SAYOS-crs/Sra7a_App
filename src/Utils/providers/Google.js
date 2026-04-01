import { OAuth2Client } from "google-auth-library";
import { Google_ClintID } from "../../../config/config.service.js";
export default async function VerifyGoogleToken(idToken) {
  const client = new OAuth2Client();
  //   ===================================
  const ticket = await client.verifyIdToken({
    idToken,
    audience: Google_ClintID,
  });

  //   ===================================
  const payload = ticket.getPayload();
  return payload;
}
