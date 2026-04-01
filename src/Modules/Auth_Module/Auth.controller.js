import { Router } from "express";
import {
  Google_social_provider,
  Login,
  refreshToken,
  SignUp,
} from "./Auth.service.js";
const router = Router();

router.post("/login", Login);
router.post("/signup", SignUp);
router.post("/Login-Google", Google_social_provider);
router.get("/refresh-token", refreshToken);
export default router;
