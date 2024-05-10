import express from 'express'
const router = express.Router();

import { verififyOtp, login, refreshToken, logOut } from '../controllers/auth.js'

router.post('/register', login);
router.post('/verify', verififyOtp);
router.post('/login', login);
router.get('/refreshToken', refreshToken);
router.get('/logout', logOut);

export { router as authRouter };