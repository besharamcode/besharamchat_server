import { transporter, verifyEmailHTML } from "../constants/mail.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Some thing wronge while generating tokens!");
  }
};

async function main(to, subject, text, html) {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: "besharamcode@gmail.com", // sender address
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: ", info.messageId);
    return true;
  } catch (error) {
    console.log(error);
    process.exit(1);
    return false;
  }
}

export const sendVerifyMail = async (email, token) => {
  const html = verifyEmailHTML(token);
  const send = await main(email, "This is your confirmation email", null, html);
  if (send) return true;
  else return false;
};
