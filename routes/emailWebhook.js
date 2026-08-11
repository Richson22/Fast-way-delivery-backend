const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const EmailThread = require("../models/EmailThread");

const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: must receive the RAW body for signature verification,
// so this route needs express.raw() — see app.js wiring note below.
router.post(
  "/webhooks/resend",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const payload = req.body.toString("utf8");

      const event = resend.webhooks.verify({
        payload,
        headers: {
          "svix-id": req.headers["svix-id"],
          "svix-timestamp": req.headers["svix-timestamp"],
          "svix-signature": req.headers["svix-signature"],
        },
        secret: process.env.RESEND_WEBHOOK_SECRET,
      });

      if (event.type === "email.received") {
        const { data: email } = await resend.emails.receiving.get(event.data.email_id);

        const toAddress = Array.isArray(email.to) ? email.to[0] : email.to;
        const match = toAddress.match(/reply\+([a-f0-9]{24})@/i);

        if (match) {
          const threadId = match[1];
          await EmailThread.findByIdAndUpdate(threadId, {
            $push: {
              messages: {
                direction: "inbound",
                subject: email.subject,
                body: email.text || email.html,
                fromAddress: email.from,
                toAddress,
                resendId: email.id,
              },
            },
            $set: { lastMessageAt: new Date(), status: "open" },
          });
        } else {
          console.warn("Inbound email did not match any thread:", toAddress);
        }
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Resend webhook error:", err);
      res.status(400).json({ error: "Invalid webhook" });
    }
  }
);

module.exports = router;