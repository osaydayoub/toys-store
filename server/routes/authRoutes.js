import express from "express";
import {
  loginUser,
  forgotPassword,
  registerUser,
  resetPassword,
  resendVerificationCode,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-code", resendVerificationCode);

export default router;
