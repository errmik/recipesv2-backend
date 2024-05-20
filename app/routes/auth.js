import express from "express";
const router = express.Router();

import {
  verififyOtp,
  login,
  signup,
  refreshToken,
  logOut,
} from "../controllers/auth.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify", verififyOtp);
router.get("/refreshToken", refreshToken);
router.get("/logout", logOut);

export { router as authRouter };
