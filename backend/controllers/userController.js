import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import jwt from "jsonwebtoken";

const sendToken = (user, statusCode, res, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      success: true,
      message,
      token,
      user,
    });
};

// ✅ Register User
export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // ✅ Validate all fields
    if (!name || !email || !phone || !password || !role) {
      return next(new ErrorHandler("All fields are required!", 400));
    }

    // ✅ Check if email already exists
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      return next(new ErrorHandler("Email already registered!", 400));
    }

    // ✅ Create new user
    const user = await User.create({ name, email, phone, password, role });

    sendToken(user, 201, res, "User Registered Successfully!");
  } catch (error) {
    console.error("🔥 Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Login User
export const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return next(new ErrorHandler("Please provide email, password, and role.", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password.", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password.", 400));
    }

    if (user.role !== role) {
      return next(new ErrorHandler(`User with provided email and ${role} not found!`, 404));
    }

    sendToken(user, 200, res, "User Logged In Successfully!");
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Logout User
export const logout = catchAsyncErrors(async (req, res, next) => {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()), // ✅ Expire the token immediately
      })
      .status(200)
      .json({
        success: true,
        message: "Logged Out Successfully.",
      });
  } catch (error) {
    console.error("🔥 Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Get User Data (Protected)
export const getUser = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("🔥 Get User Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
