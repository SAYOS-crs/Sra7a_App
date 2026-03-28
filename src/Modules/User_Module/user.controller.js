import { Router } from "express";
import { GetProfile } from "./user.service.js";
import { Authentication } from "../../Middlewares/authentication.middleware.js";
import { SignatureType } from "../../Utils/enums/Token.Enum.js";
import { Authorization } from "../../Middlewares/authorization.middleware.js";
import { RollEnum } from "../../Utils/enums/Enums.js";
const router = Router();

router.get(
  "/profile",
  // - first middleware is checking and pass the user info in the req for the next middleware or the profile
  Authentication({ TokenType: SignatureType.AccessToken }),
  // - sucond middleware for the Authorization checking and it use the user info from the req , thanks for the Authentication middleware
  Authorization({ AuthorizedRolles: [RollEnum.User, RollEnum.Admin] }),
  // final route
  GetProfile,
);

export default router;
