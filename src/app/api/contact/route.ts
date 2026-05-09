import { contactSchema } from "@/lib/validation";
import {
  recordContactSubmission,
  updateContactSubmissionEmailStatus,
} from "@/lib/repository";
import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const sendgridApiKey = process.env.SENDGRID_API_KEY ?? "";
const sendgridToEmail = process.env.SENDGRID_TO_EMAIL ?? "vaexiltv@gmail.com";
const sendgridFromEmail =
  process.env.SENDGRID_FROM_EMAIL ?? process.env.SENDGRID_TO_EMAIL ?? "";

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const submissionId = await recordContactSubmission(parsed.data);

  if (!sendgridApiKey || !sendgridToEmail || !sendgridFromEmail) {
    await updateContactSubmissionEmailStatus(submissionId, "disabled");
    console.warn("SendGrid is not configured. Vaexil contact message was recorded only.");
    return NextResponse.json(
      { success: true, message: "Message recorded. Thanks for reaching out." },
      { status: 202 },
    );
  }

  const textBody = [
    `Name: ${parsed.data.name}`,
    `Email: ${parsed.data.email}`,
    `Organization: ${parsed.data.organization || "Not provided"}`,
    `Inquiry type: ${parsed.data.inquiryType}`,
    "",
    "Message:",
    parsed.data.message,
  ].join("\n");

  try {
    await sgMail.send({
      to: sendgridToEmail,
      from: sendgridFromEmail,
      replyTo: parsed.data.email,
      subject: `Vaexil.tv ${parsed.data.inquiryType} inquiry - ${parsed.data.name}`,
      text: textBody,
    });

    await updateContactSubmissionEmailStatus(submissionId, "sent");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vaexil SendGrid error", error);
    await updateContactSubmissionEmailStatus(submissionId, "failed");
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
