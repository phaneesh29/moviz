import { Resend } from "resend";
import { RESEND_API_KEY } from "../constant.js";

const resend = new Resend(RESEND_API_KEY);

export const feedbackController = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email and message are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    const label = `Vidoza Feedback`;
    const feedbackSubject = subject?.trim()
        ? `[${label}] ${subject}`
        : `[${label}] New feedback from ${name}`;

    const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">📬 New Feedback — Vidoza</h2>
            <hr style="border: 1px solid #e5e7eb;" />
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 100px;">Name</td>
                    <td style="padding: 8px 0; color: #111827;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email</td>
                    <td style="padding: 8px 0; color: #111827;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject</td>
                    <td style="padding: 8px 0; color: #111827;">${subject || "N/A"}</td>
                </tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #7c3aed;">
                <p style="margin: 0; font-weight: bold; color: #374151;">Message</p>
                <p style="margin: 8px 0 0; color: #111827; white-space: pre-wrap;">${message}</p>
            </div>
            <hr style="border: 1px solid #e5e7eb; margin-top: 24px;" />
            <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
                Sent via Vidoza Feedback Form
            </p>
        </div>
    `;

    const { data, error } = await resend.emails.send({
        from: "Vidoza Feedback <onboarding@resend.dev>",
        to: "kanugovisreephaneesha@gmail.com",
        subject: feedbackSubject,
        html: htmlBody,
        tags: [{ name: "category", value: "feedback" }],
    });

    if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ message: "Failed to send feedback. Please try again later." });
    }

    return res.status(200).json({ message: "Feedback sent successfully!", id: data?.id });
};
