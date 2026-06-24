const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  label: String,
  time: String,
  location: String,
  done: { type: Boolean, default: false },
  latest: { type: Boolean, default: false },
});

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  status: String,
  statusLabel: String,
  estimatedDelivery: String,
  currentLocation: String,
  serviceType: String,
  weight: String,
  dimensions: String,
  estimatedTotal: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userEmail: { type: String, default: "" },
  destinationCity: String,
  currentCoords: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
  timeline: [timelineSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shipment", shipmentSchema);