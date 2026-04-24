import { Router } from "express";
import {
  GetSinglerMessage,
  GetMessages,
  SendMessage,
  SendMessage_Authed,
} from "./message.service.js";
import { Authentication } from "../../Middlewares/authentication.middleware.js";
import { SignatureType } from "../../Utils/enums/Token.Enum.js";
import { Authorization } from "../../Middlewares/authorization.middleware.js";
import { RollEnum } from "../../Utils/enums/Enums.js";
import validation from "../../Middlewares/validation.middleware.js";
import {
  Authed_SendmessageValidation,
  GetmessageValidation,
  GetSinglemessageValidation,
  SendmessageValidation,
} from "./message.validation.js";
const router = Router();
// ----------------- send message --------------------
// no auth requied
router.post(
  "/Send-message/:UserId",
  validation({ schema: SendmessageValidation }),
  SendMessage,
);
// auth required
router.post(
  "/Send-message-authed/:UserId",
  validation({ schema: Authed_SendmessageValidation }),
  Authentication({ TokenType: SignatureType.AccessToken }),
  Authorization({ AuthorizedRolles: [RollEnum.User, RollEnum.Admin] }),
  SendMessage_Authed,
);
// ----------------- get user message ----------------
router.get(
  "/GetUserMessage{/:UserId}",
  validation({ schema: GetmessageValidation }),
  Authentication({ TokenType: SignatureType.AccessToken }),
  Authorization({ AuthorizedRolles: [RollEnum.Admin, RollEnum.User] }),
  GetMessages,
);
// get massage by admin
router.get(
  "/GetSingleUserMessage/:messageID",
  validation({ schema: GetSinglemessageValidation }),
  Authentication({ TokenType: SignatureType.AccessToken }),
  Authorization({ AuthorizedRolles: [RollEnum.Admin] }),
  GetSinglerMessage,
);
export default router;
