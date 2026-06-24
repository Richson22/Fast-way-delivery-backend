const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendShipmentConfirmation(toEmail, shipment) {
  const { data, error } = await resend.emails.send({
    from: "Fast Way Delivery <onboarding@resend.dev>",
    to: toEmail,
    subject: `Shipment Confirmed — ${shipment.trackingNumber}`,
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:24px;border-radius:12px;">
        
        <div style="background:#1e3a5f;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;font-size:1.4rem;">Fast Way Delivery</h1>
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
          © 2026 Fast Way Delivery. All rights reserved.<br/>
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

module.exports = { sendShipmentConfirmation };