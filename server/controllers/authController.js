import jwt from "jsonwebtoken";
import User from "../models/user.js";
import STATUS_CODE from "../constants/statusCodes.js";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sendEmail from "../utils/sendEmail.js";

const emailLogoPath = fileURLToPath(
  new URL("../../client/src/assets/logo.png", import.meta.url)
);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const hashVerificationCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const sendVerificationCode = async (user) => {
  const code = generateVerificationCode();

  user.emailVerificationCode = hashVerificationCode(code);
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  user.emailVerificationAttempts = 0;
  user.emailVerificationLastSentAt = new Date();

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: "Your verification code - Baby Kids Toys",
    text: `Welcome to Baby Kids Toys. Your verification code is ${code}. This code expires in 10 minutes. If you did not create this account, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; max-width: 520px; margin: 0 auto; padding: 24px;">
        <img
          src="cid:baby-kids-toys-logo"
          alt="Baby Kids Toys"
          width="110"
          height="110"
          style="display: block; width: 110px; height: 110px; object-fit: cover; border-radius: 50%; margin: 0 auto 20px;"
        />
        <h2>Welcome to Baby Kids Toys 🧸</h2>
        <p>Enter this verification code to finish creating your account:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 10px; margin: 24px 0;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
    attachments: [
      {
        filename: "baby-kids-toys-logo.png",
        path: emailLogoPath,
        cid: "baby-kids-toys-logo",
      },
    ],
  });
};

const sendPasswordResetCode = async (user) => {
  const code = generateVerificationCode();

  user.passwordResetToken = hashVerificationCode(code);
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetAttempts = 0;
  user.passwordResetLastSentAt = new Date();

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: "Reset your password - Baby Kids Toys",
    text: `Your Baby Kids Toys password reset code is ${code}. This code expires in 10 minutes. If you did not request a password reset, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; max-width: 520px; margin: 0 auto; padding: 24px;">
        <img
          src="cid:baby-kids-toys-logo"
          alt="Baby Kids Toys"
          width="110"
          height="110"
          style="display: block; width: 110px; height: 110px; object-fit: cover; border-radius: 50%; margin: 0 auto 20px;"
        />
        <h2>Reset your password</h2>
        <p>Enter this code to choose a new password:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 10px; margin: 24px 0;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
    attachments: [
      {
        filename: "baby-kids-toys-logo.png",
        path: emailLogoPath,
        cid: "baby-kids-toys-logo",
      },
    ],
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(STATUS_CODE.CONFLICT).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
    });

    await sendVerificationCode(user);

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: "Account created. Enter the code sent to your email.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Email is required",
      });
    }

    const responseMessage =
      "If an account exists for this email, a password reset code was sent.";
    const user = await User.findOne({ email }).select(
      "+passwordResetLastSentAt"
    );

    if (!user) {
      return res.status(STATUS_CODE.OK).json({
        success: true,
        message: responseMessage,
      });
    }

    const secondsSinceLastSend = user.passwordResetLastSentAt
      ? (Date.now() - user.passwordResetLastSentAt.getTime()) / 1000
      : 60;

    if (secondsSinceLastSend >= 60) {
      await sendPasswordResetCode(user);
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();
    const password = req.body.password;

    if (!email || !/^\d{6}$/.test(code || "")) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Enter a valid 6-digit reset code",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetToken +passwordResetAttempts"
    );

    if (
      !user ||
      !user.passwordResetToken ||
      !user.passwordResetExpires ||
      user.passwordResetExpires <= Date.now()
    ) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    if (user.passwordResetAttempts >= 5) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    if (user.passwordResetToken !== hashVerificationCode(code)) {
      user.passwordResetAttempts += 1;
      await user.save({ validateBeforeSave: false });

      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    user.password = password;
    user.isEmailVerified = true;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetAttempts = 0;
    user.passwordResetLastSentAt = undefined;

    await user.save();

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();

    if (!email || !/^\d{6}$/.test(code || "")) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Enter a valid 6-digit verification code",
      });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationCode +emailVerificationAttempts"
    );

    if (
      !user ||
      user.isEmailVerified ||
      !user.emailVerificationCode ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires <= Date.now()
    ) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    if (user.emailVerificationAttempts >= 5) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    if (user.emailVerificationCode !== hashVerificationCode(code)) {
      user.emailVerificationAttempts += 1;
      await user.save({ validateBeforeSave: false });

      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationAttempts = 0;
    user.emailVerificationLastSentAt = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Email verified successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationLastSentAt"
    );

    if (!user || user.isEmailVerified) {
      return res.status(STATUS_CODE.OK).json({
        success: true,
        message: "If the account requires verification, a new code was sent.",
      });
    }

    const secondsSinceLastSend = user.emailVerificationLastSentAt
      ? (Date.now() - user.emailVerificationLastSentAt.getTime()) / 1000
      : 60;

    if (secondsSinceLastSend < 60) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: `Please wait ${Math.ceil(60 - secondsSinceLastSend)} seconds before requesting another code`,
      });
    }

    await sendVerificationCode(user);

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "A new verification code was sent.",
    });
  } catch (error) {
    next(error);
  }
};

const profileData = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
});

export const getProfile = async (req, res) => {
  res.status(STATUS_CODE.OK).json({
    success: true,
    data: profileData(req.user),
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const phone = req.body.phone?.trim();

    if (!name) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!/^05\d{8}$/.test(phone || "")) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Enter a valid Israeli phone number",
      });
    }

    const user = await User.findById(req.user._id);
    user.name = name;
    user.phone = phone;
    await user.save();

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: profileData(user),
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if (!currentPassword) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Current password is required",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (await user.matchPassword(newPassword)) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
