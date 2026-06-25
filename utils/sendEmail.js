const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendShipmentConfirmation(toEmail, shipment) {
  const { data, error } = await resend.emails.send({
    from: "Fast Way Shiping <delivery@fastwayshiping.com>",
    to: toEmail,
    subject: `Shipment Confirmed — ${shipment.trackingNumber}`,
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:24px;border-radius:12px;">
        
        <div style="background:#1e3a5f;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;font-size:1.4rem;">Fast Way Shiping</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.9rem;">Shipment Confirmation Receipt</p>
        </div>

        <div style="background:#fff;border-radius:10px;padding:24px;margin-bottom:16px;">
          <div style="margin-bottom:16px;">
            <p style="margin:0;font-weight:700;color:#1e293b;font-size:1rem;">✅ Shipment Created Successfully!</p>
          </div>
          <p style="color:#64748b;font-size:0.88rem;margin:0 0 16px;">
            Your shipment has been created and is awaiting pickup. Use the tracking number below to monitor your delivery.
          </p>

          <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:0.75rem;color:#94a3b8;font-weight:600;letter-spacing:0.08em;">TRACKING NUMBER</p>
            <p style="margin:0;font-size:1.4rem;font-weight:800;color:#f97316;">${shipment.trackingNumber}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;color:#64748b;">Service Type</td>
              <td style="padding:8px 0;color:#f97316;font-weight:700;text-align:right;">${shipment.serviceType}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;color:#64748b;">Weight</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${shipment.weight}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;color:#64748b;">Dimensions</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${shipment.dimensions}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;color:#64748b;">Origin</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${shipment.currentLocation}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;color:#64748b;">Destination</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${shipment.destinationCity ?? "—"}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0;color:#64748b;">Estimated Delivery</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${shipment.estimatedDelivery}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;">Total Paid</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:700;text-align:right;">${shipment.estimatedTotal}</td>
            </tr>
          </table>
        </div>

        <div style="background:#fff;border-radius:10px;padding:16px;margin-bottom:16px;text-align:center;">
          <p style="margin:0 0 8px;font-size:0.82rem;color:#64748b;">Track your shipment anytime at</p>
          <p style="margin:0;font-size:0.9rem;font-weight:700;color:#1e3a5f;">fastwaydelivery.com/track</p>
        </div>

        <p style="text-align:center;font-size:0.75rem;color:#94a3b8;margin:0;">
          © 2026 Fast Way Shipping. All rights reserved.<br/>
          If you didn't create this shipment, please contact support immediately.
        </p>
      </div>
    `,
});
  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }
  console.log("Resend response:", data);
}

async function sendAdminOTP(toEmail, otp) {
  const { data, error } = await resend.emails.send({
    from: "Fast Way Shipping <delivery@fastwayshiping.com>",
    to: toEmail,
    subject: "Your Admin Login Code",
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:480px;margin:0 auto;background:#f0f2f5;padding:24px;border-radius:12px;">
        <div style="background:#1a2e44;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;font-size:1.3rem;">Fast Way Shipping</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.85rem;">Admin Portal — Login Verification</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:24px;text-align:center;">
          <p style="color:#1a2e44;font-weight:600;margin:0 0 16px;">Your one-time login code is:</p>
          <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:8px;padding:20px;margin-bottom:16px;">
            <p style="margin:0;font-size:2rem;font-weight:800;color:#ff6b00;letter-spacing:0.2em;">${otp}</p>
          </div>
          <p style="color:#64748b;font-size:0.82rem;margin:0;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#64748b;font-size:0.82rem;margin:8px 0 0;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });
  if (error) {
    console.error("Resend OTP error:", error);
    throw new Error(error.message);
  }
  console.log("OTP email sent:", data);
}

async function sendPasswordReset(toEmail, resetLink) {
  const { data, error } = await resend.emails.send({
    from: "Fast Way Shipping <delivery@fastwayshiping.com>",
    to: toEmail,
    subject: "Reset Your Password — Fast Way Shipping",
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:480px;margin:0 auto;background:#f0f2f5;padding:24px;border-radius:12px;">
        <div style="background:#1a2e44;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;font-size:1.3rem;">Fast Way Shipping</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.85rem;">Password Reset Request</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:24px;text-align:center;">
          <p style="font-size:2rem;margin:0 0 12px;">🔐</p>
          <p style="color:#1a2e44;font-weight:700;font-size:1rem;margin:0 0 8px;">Reset your password</p>
          <p style="color:#64748b;font-size:0.85rem;margin:0 0 24px;line-height:1.6;">
            Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.
          </p>
          <a href="${resetLink}" style="display:inline-block;background:#1a2e44;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:0.95rem;margin-bottom:20px;">
            Reset Password →
          </a>
          <p style="color:#94a3b8;font-size:0.78rem;margin:0;">
            If you didn't request this, ignore this email — your password won't change.
          </p>
        </div>
      </div>
    `,
  });
  if (error) {
    console.error("Resend reset error:", error);
    throw new Error(error.message);
  }
  console.log("Reset email sent:", data);
}

module.exports = { sendShipmentConfirmation, sendAdminOTP, sendPasswordReset };