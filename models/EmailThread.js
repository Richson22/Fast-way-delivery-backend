const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    direction: { type: String, enum: ["outbound", "inbound"], required: true },
    subject: String,
    body: String,
    fromAddress: String,
    toAddress: String,
    resendId: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const emailThreadSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true, index: true },
    subject: String,
    status: { type: String, enum: ["open", "closed"], default: "open" },
    lastMessageAt: { type: Date, default: Date.now },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailThread", emailThreadSchema);