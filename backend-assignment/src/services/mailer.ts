import nodemailer from "nodemailer";
import { config } from "../config/env";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    let auth = undefined;
    if (config.smtp.user && config.smtp.pass) {
      auth = { user: config.smtp.user, pass: config.smtp.pass };
    } else {
      console.log("[mailer] Generating Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      auth = { user: testAccount.user, pass: testAccount.pass };
      console.log(`[mailer] Ethereal account generated: ${testAccount.user}`);
    }

    transporter = nodemailer.createTransport({
      host: config.smtp.host || "smtp.ethereal.email",
      port: config.smtp.port || 587,
      secure: config.smtp.port === 465,
      auth,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: any[];
}

export async function sendMail(opts: MailOptions): Promise<boolean> {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: config.smtp.user || "no-reply@reachinbox.app",
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({
        filename: a.name,
        contentType: a.type,
        content: a.content.split(",")[1] || a.content,
        encoding: "base64",
      })),
    });
    console.log(
      `[mailer] Email sent to ${opts.to}. Preview URL: ${nodemailer.getTestMessageUrl(info) || "N/A"}`,
    );
    return true;
  } catch (err) {
    console.error("[mailer] delivery failed:", err);
    return false;
  }
}
