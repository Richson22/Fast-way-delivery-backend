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

module.exports = router;