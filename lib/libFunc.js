import { verifyEmailHTML } from "../constants/mail.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { error, data } = await resend.emails.send({
      from: "Team@myquizcode.com",
      to: to,
      subject: subject,
      text,
      html,
    });
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log(data);
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const sendVerifyMail = async (email, token) => {
  const html = verifyEmailHTML(token);
  const send = await main(email, "This is your confirmation email", null, html);
  if (send) return true;
  else return false;
};
