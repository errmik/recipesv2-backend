import express from "express";
const router = express.Router();

import {
  verifyOtp,
  loginWithGithub,
  login,
  signup,
  refreshToken,
  logOut,
} from "../controllers/auth.js";

router.post("/signup", signup);
router.post("/login", login);
router.get("/github", loginWithGithub);
router.post("/verify", verifyOtp);
router.get("/refreshToken", refreshToken);
router.get("/logout", logOut);

export { router as authRouter };
