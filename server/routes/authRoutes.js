import express from "express";
import { loginUser, registerUser, verifyEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);

export default router;