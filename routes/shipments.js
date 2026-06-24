const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");

router.get("/:trackingNumber", async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase(),
    });
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const shipments = await Shipment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    // Attach userId if token provided
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET || "fastway_secret_key");
        req.body.userId = decoded.id;
        req.body.userEmail = decoded.email;
      } catch {}
    }
    const shipment = new Shipment(req.body);
    await shipment.save();

    // Send confirmation email if provided
   console.log("Email from request:", req.body.email);
if (req.body.email) {
      const { sendShipmentConfirmation } = require("../utils/sendEmail");
      sendShipmentConfirmation(req.body.email, shipment)
        .then(() => console.log("Email sent successfully to:", req.body.email))
        .catch((err) => console.error("Email failed:", err.message));
    } else {
      console.log("No email provided — skipping email send");
    }
    res.status(201).json(shipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/receipts";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.trackingNumber}-receipt${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post("/:trackingNumber/receipt", upload.single("receipt"), async (req, res) => {
  try {
    const shipment = await Shipment.findOneAndUpdate(
      { trackingNumber: req.params.trackingNumber },
      { receiptUrl: req.file.path },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    res.json({ success: true, receiptUrl: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Receipt upload failed" });
  }
});

module.exports = router;