module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const notifyTo = process.env.ADMIN_REPORT_NOTIFY_TO || "info@cannakan.com";
  const fromEmail = process.env.ADMIN_REPORT_NOTIFY_FROM || "";
  const resendApiKey = process.env.RESEND_API_KEY || "";

  if (!fromEmail || !resendApiKey) {
    // TODO: Configure ADMIN_REPORT_NOTIFY_FROM and RESEND_API_KEY in Vercel to enable live admin email alerts.
    return response.status(202).json({
      ok: false,
      skipped: true,
      reason: "Email notification backend is not configured yet.",
    });
  }

  try {
    const payload = typeof request.body === "string"
      ? JSON.parse(request.body || "{}")
      : (request.body || {});

    const submittedAt = String(payload.createdAt || new Date().toISOString()).trim();
    const lines = [
      "A new Cannakan Grow report was submitted.",
      "",
      `Name: ${String(payload.name || "").trim() || "Not provided"}`,
      `Email: ${String(payload.email || "").trim() || "Not provided"}`,
      `Issue type: ${String(payload.issueType || "").trim() || "Other"}`,
      `Submitted: ${submittedAt}`,
      `User ID: ${String(payload.userId || "").trim() || "Not provided"}`,
      "",
      "Message:",
      String(payload.message || "").trim() || "No message provided.",
    ];

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyTo],
        subject: "New Cannakan Grow Report Submitted",
        text: lines.join("\n"),
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(errorText || `Resend returned ${resendResponse.status}`);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin-report-notify] Failed to send email notification.", error);
    return response.status(500).json({
      ok: false,
      error: "Could not send email notification.",
    });
  }
};
