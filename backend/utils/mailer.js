import nodemailer from "nodemailer";
import { logger } from "./logger.js";

/**
 * Sends a password reset OTP to the user's email.
 * If credentials are not set, falls back to logging the OTP in the console.
 * 
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} Resolves to true if email sent (or fallback logged) successfully
 */
export const sendOtpEmail = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    logger.info(`[Fallback OTP Logger] OTP for ${email}: ${otp}`);
    console.log(`\n--- [Fallback OTP Logger] ---\nOTP for ${email}: ${otp}\n-----------------------------\n`);
    return true;
  }

  // Strip spaces from the password (Google App Passwords are generated as 4x4 blocks with spaces)
  const cleanPass = emailPass.replace(/\s+/g, "");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: cleanPass
      }
    });

    const mailOptions = {
      from: `"RevaConnect" <${emailUser}>`,
      to: email,
      subject: "RevaConnect Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fdfdfd;">
          <h2 style="color: #F37021; text-align: center; border-bottom: 2px solid #F37021; padding-bottom: 10px;">RevaConnect</h2>
          <h3 style="color: #333;">Password Reset Request</h3>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #F37021; letter-spacing: 5px; background: #FFF3EB; padding: 10px 20px; border-radius: 5px; border: 1px solid #FFE3D1;">${otp}</span>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
          <p>Regards,<br/><strong>RevaConnect Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #888; text-align: center;">© 2026 REVA University - RevaConnect. All rights reserved.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info({ email }, "OTP email sent successfully via Gmail SMTP");
    return true;
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Gmail SMTP failed. Falling back to console logger.");
    
    // SMTP Failed: Use fallback console logger so the server doesn't crash and user gets a response
    logger.info(`[Fallback OTP Logger] (SMTP Error Fallback) OTP for ${email}: ${otp}`);
    console.log(`\n--- [Fallback OTP Logger] (SMTP Error Fallback) ---\nOTP for ${email}: ${otp}\n-------------------------------------------------\n`);
    return false;
  }
};
