const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "fastway_secret_key";

function protect(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

router.post("/register", async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(req.body.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Shipment = require("../models/Shipment");

router.get("/my-shipments", protect, async (req, res) => {
  try {
    const shipments = await Shipment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get current user profile ──
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const crypto = require("crypto");

// ── Forgot password ──
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });

    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.resetToken       = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/ResetPassword?token=${token}`;
    const { sendPasswordReset } = require("../utils/sendEmail");
    await sendPasswordReset(user.email, resetLink);

    res.json({ message: "Reset link sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Reset password ──
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset link." });

    user.password         = password;
    user.resetToken       = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, protect };