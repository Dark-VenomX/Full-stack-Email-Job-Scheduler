import nodemailer from 'nodemailer';
import { config, useMocks } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    let auth = undefined;
    if (config.smtp.user && config.smtp.pass) {
      auth = { user: config.smtp.user, pass: config.smtp.pass };
    } else if (!useMocks) {
      console.log('[mailer] Generating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      auth = { user: testAccount.user, pass: testAccount.pass };
      console.log(`[mailer] Ethereal account generated: ${testAccount.user}`);
    }

    transporter = nodemailer.createTransport({
      host: config.smtp.host || 'smtp.ethereal.email',
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
}

export async function sendMail(opts: MailOptions): Promise<boolean> {
  if (useMocks) {
    // Sandbox: no real SMTP. Log and report success so the flow previews.
    console.log(`[mailer:mock] -> ${opts.to} | ${opts.subject}`);
    return true;
  }
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: config.smtp.user || 'no-reply@reachinbox.app',
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    console.log(`[mailer] Email sent to ${opts.to}. Preview URL: ${nodemailer.getTestMessageUrl(info) || 'N/A'}`);
    return true;
  } catch (err) {
    console.error('[mailer] delivery failed:', err);
    return false;
  }
}
