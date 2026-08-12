const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Shipment = require("../models/Shipment");
const EmailThread = require("../models/EmailThread");

const JWT_SECRET = process.env.JWT_SECRET || "fastway_secret_key";

// ── Auth middleware ──
function protect(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ── Register first admin (run once, then disable) ──
router.post("/register", async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });
    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: "Admin created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Login — step 1: verify password, send OTP ──
router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });
    const match = await admin.comparePassword(req.body.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    admin.otpCode = otp;
    admin.otpExpiry = expiry;
    await admin.save();

    // Send OTP email via Resend
    const { sendAdminOTP } = require("../utils/sendEmail");
    await sendAdminOTP(admin.email, otp);

    res.json({ message: "OTP sent to your email", email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login — step 2: verify OTP ──
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid request" });
    if (!admin.otpCode || admin.otpCode !== otp) return res.status(401).json({ message: "Invalid OTP code" });
    if (new Date() > admin.otpExpiry) return res.status(401).json({ message: "OTP has expired. Please login again." });

    // Clear OTP
    admin.otpCode = null;
    admin.otpExpiry = null;
    await admin.save();

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get all users ──
const User = require("../models/User");

router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get all shipments ──
router.get("/shipments", protect, async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update shipment (status, timeline, estimatedDelivery) ──
router.put("/shipments/:id", protect, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    if (req.body.status === "Custom Cleared") {
      const toEmail = shipment.userEmail || shipment.email;
      if (toEmail) {
        const { sendCustomsClearedEmail } = require("../utils/sendEmail");
        sendCustomsClearedEmail(toEmail, shipment)
          .then(() => console.log("Customs cleared email sent to:", toEmail))
          .catch((err) => console.error("Customs cleared email failed:", err.message));
      }
    }

    res.json(shipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Delete shipment ──
router.delete("/shipments/:id", protect, async (req, res) => {
  try {
    await Shipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Send mail + optionally append to thread ──
const { sendAdminMail } = require("../utils/sendEmail");

router.post("/send-mail", protect, async (req, res) => {
  const { to, subject, message, threadId } = req.body;
  if (!to || !subject || !message)
    return res.status(400).json({ error: "to, subject and message are required." });
  try {
    const data = await sendAdminMail({ to, subject, message });

    if (threadId) {
      // append reply to existing thread
      await EmailThread.findByIdAndUpdate(threadId, {
        $push: { messages: { direction: "outbound", body: message, createdAt: new Date() } },
        $set:  { lastMessageAt: new Date() },
      });
    } else {
      // create new thread
      await EmailThread.create({
        customerEmail: to,
        subject,
        messages: [{ direction: "outbound", body: message, createdAt: new Date() }],
        lastMessageAt: new Date(),
      });
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/threads", protect, async (req, res) => {
  try {
    const threads = await EmailThread.find().sort({ lastMessageAt: -1, updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Delete a single thread ──
router.delete("/threads/:id", protect, async (req, res) => {
  try {
    await EmailThread.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Delete ALL threads (bulk clear) ──
router.delete("/threads", protect, async (req, res) => {
  try {
    const result = await EmailThread.deleteMany({});
    res.json({ message: "All threads deleted", count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, protect };