import jwt from "jsonwebtoken";
import User from "../models/user.js";
import STATUS_CODE from "../constants/statusCodes.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "Not authorized, no token",
        code: "AUTH_TOKEN_MISSING",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User not found",
        code: "AUTH_USER_NOT_FOUND",
      });
    }

    next();
  } catch (error) {
    const isExpiredToken = error.name === "TokenExpiredError";

    return res.status(STATUS_CODE.UNAUTHORIZED).json({
      success: false,
      message: isExpiredToken
        ? "Not authorized, token expired"
        : "Not authorized, token failed",
      code: isExpiredToken ? "AUTH_TOKEN_EXPIRED" : "AUTH_TOKEN_INVALID",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(STATUS_CODE.FORBIDDEN).json({
      success: false,
      message: "Admin access only",
    });
  }
};
