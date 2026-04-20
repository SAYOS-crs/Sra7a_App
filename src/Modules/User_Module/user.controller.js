import { Router } from "express";
import {
  SuspendUser,
  GetProfile,
  PatchPhoto,
  Admin_RestoreUser,
  Self_RestoreUser,
  ReactivateUser,
} from "./user.service.js";
import { Authentication } from "../../Middlewares/authentication.middleware.js";
import { SignatureType } from "../../Utils/enums/Token.Enum.js";
import { Authorization } from "../../Middlewares/authorization.middleware.js";
import { RollEnum } from "../../Utils/enums/Enums.js";
import { LocalFileStorge } from "../../Utils/multer/multer.local.js";
import ImageTypes from "../../Utils/files-type/images.js";
import filefilter from "../../Middlewares/filetype.middleware.js";

const router = Router();
router.patch(
  "/uploud-photo",
  // - first middleware is checking and pass the user info in the req for the next middleware or the profile
  Authentication({ TokenType: SignatureType.AccessToken }),
  // - sucond middleware for the Authorization checking and it use the user info from the req , thanks for the Authentication middleware
  Authorization({ AuthorizedRolles: [RollEnum.User, RollEnum.Admin] }),
  // - third middleware for handling file uploud with multer
  LocalFileStorge({ GeneralPath: "Users" }).single("photo"),

  filefilter({ allowedTypes: ImageTypes }),
  // final route
  PatchPhoto,
);

router.get(
  "/profile",
  // - first middleware is checking and pass the user info in the req for the next middleware or the profile
  Authentication({ TokenType: SignatureType.AccessToken }),
  // - sucond middleware for the Authorization checking and it use the user info from the req , thanks for the Authentication middleware
  Authorization({ AuthorizedRolles: [RollEnum.User, RollEnum.Admin] }),
  // final route
  GetProfile,
);
// freez user
router.delete(
  "/SuspendUser{/:UserId}",
  Authentication({ TokenType: SignatureType.AccessToken }),
  Authorization({ AuthorizedRolles: [RollEnum.User, RollEnum.Admin] }),
  SuspendUser,
);
// restore user by admin - any admin can restor that user
router.patch(
  "/Admin-RestoreUser/:UserId",
  Authentication({ TokenType: SignatureType.AccessToken }),
  Authorization({ AuthorizedRolles: [RollEnum.Admin] }),
  Admin_RestoreUser,
);
router.post("/self-RestoreUser", Self_RestoreUser);
router.patch("/Reactivate-User", ReactivateUser);
export default router;
