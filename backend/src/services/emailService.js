// src/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// 🔧 Configure Nodemailer Transport
const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SECURE } = process.env;

  // Fallback for development if env vars are missing
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    logger.warn('⚠️ SMTP credentials missing. Emails will be logged to console instead of sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT) || 587,
    secure: EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Often needed for dev/self-signed certs
    },
  });
};

const transporter = createTransporter();

// 📤 Core Send Function
const sendEmail = async (options) => {
  const { to, subject, html, text } = options;

  const mailOptions = {
    from: `"EventO Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Auto-strip HTML for plain-text fallback
  };

  // Dev mode: intercept & log
  if (!transporter) {
    logger.info('📧 [DEV MODE] Email intercepted:', { to, subject, preview: text || 'HTML email' });
    return { success: true, messageId: 'dev-intercepted' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Failed to send email', { error: error.message, to, subject });
    // Don't throw; allow request to succeed but log failure for monitoring
    return { success: false, messageId: null, error: error.message };
  }
};

// 📧 Business Email Senders

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const subject = 'Verify Your EventO Account';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to EventO!</h2>
      <p>Please verify your email address to activate your account:</p>
      <a href="${verificationUrl}" style="display: inline-block; background: #4F46E5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Reset Your EventO Password';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #DC2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">This link expires in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

exports.sendBookingConfirmation = async (email, booking, event) => {
  const subject = 'Booking Confirmed ✅';
  const ticketsHtml = booking.ticketCodes.map(code => `<li style="margin: 4px 0;"><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${code}</code></li>`).join('');
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Booking Confirmed!</h2>
      <p>Hi there,</p>
      <p>Your booking for <strong>${event.title}</strong> on <strong>${new Date(event.date).toLocaleDateString()}</strong> is confirmed.</p>
      <h3>🎟️ Your Tickets:</h3>
      <ul>${ticketsHtml}</ul>
      <p>See you at the event!</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

exports.sendBookingCancellation = async (email, event) => {
  const subject = 'Booking Cancelled ❌';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #B91C1C;">Booking Cancelled</h2>
      <p>Your booking for <strong>${event.title}</strong> has been successfully cancelled.</p>
      <p>If eligible, your refund will be processed back to your original payment method within 5-7 business days.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};