const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create a transporter instance
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async (options) => {
  try {
    const transporter = getTransporter();

    const message = {
      from: `${process.env.EMAIL_FROM_NAME || 'EventO'} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Message sent: %s ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    return false;
  }
};

const sendVerificationEmail = async (user, verificationUrl) => {
  const message = `Please confirm your email by clicking the following link: \n\n ${verificationUrl}`;
  const html = `
    <h1>Welcome to EventO, ${user.name}!</h1>
    <p>Please confirm your email by clicking the link below:</p>
    <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #0C447C; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  return await sendEmail({
    email: user.email,
    subject: 'Email Verification - EventO',
    message,
    html,
  });
};

const sendBookingConfirmation = async (user, booking, event) => {
  const message = `Your booking for ${event.title} is confirmed.\n\nBooking ID: ${booking._id}\nTotal Amount: $${booking.totalAmount}`;
  const html = `
    <h1>Booking Confirmed!</h1>
    <p>Thank you for booking with EventO, ${user.name}.</p>
    <h2>Event: ${event.title}</h2>
    <p><strong>Date:</strong> ${new Date(event.date.start).toLocaleString()}</p>
    <p><strong>Booking ID:</strong> ${booking._id}</p>
    <p><strong>Total Paid:</strong> $${booking.totalAmount}</p>
    <p>Please log in to your dashboard to view your tickets and QR code.</p>
  `;

  return await sendEmail({
    email: user.email,
    subject: `Booking Confirmed: ${event.title}`,
    message,
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendBookingConfirmation,
};
