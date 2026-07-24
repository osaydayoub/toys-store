import express from "express";
import {
  changePassword,
  getProfile,
  loginUser,
  forgotPassword,
  getSavedAddresses,
  registerUser,
  resetPassword,
  resendVerificationCode,
  updateProfile,
  deleteSavedAddress,
  verifyEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-code", resendVerificationCode);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/password", protect, changePassword);
router.get("/saved-addresses", protect, getSavedAddresses);
router.delete("/saved-addresses/:id", protect, deleteSavedAddress);

export default router;
