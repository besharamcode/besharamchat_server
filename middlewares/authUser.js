import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authUser = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader) throw new ApiError(401, "Unauthorized Access");
  else {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    if (!accessToken) throw new ApiError(401, "Unauthorized Access");
    else {
      const data = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
      if (data.exp < Date.now()) throw new ApiError(401, "Token expired!");
      else {
        req.user = data.userId;
        next();
      }
    }
  }
});

export const verifyUser = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.header("authorization");
  if (!authorizationHeader) throw new ApiError(401, "Unauthorized Access");
  else {
    const OTPToken = authorizationHeader.replace("Bearer ", "");
    if (!OTPToken) throw new ApiError(401, "Unauthorized Access");
    else {
      const data = jwt.verify(OTPToken, process.env.VERIFY_TOKEN_KEY);
      if (data.exp < Date.now()) throw new ApiError(401, "Token expired!");
      else {
        req.user = data.userId;
        next();
      }
    }
  }
});
