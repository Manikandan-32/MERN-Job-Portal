import express from "express";
import { login, register, logout, getUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ✅ User Authentication Routes
router.post("/register", register); // Register User
router.post("/login", login); // Login User
router.post("/logout", logout); // ✅ Fix: Changed from GET to POST for Logout
router.get("/getuser", isAuthenticated, getUser); // Get User Data (Protected)

export default router;
