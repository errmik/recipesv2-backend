import express from "express";
const router = express.Router();

import {
  verifyOtp,
  login,
  signup,
  refreshToken,
  logOut,
} from "../controllers/auth.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify", verifyOtp);
router.get("/refreshToken", refreshToken);
router.get("/logout", logOut);

export { router as authRouter };
