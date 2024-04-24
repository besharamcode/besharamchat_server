import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Schema for Saving user Data
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      min: [8, "Password must be atleast 8 digit"],
    },
    avatar: {
      type: String,
      default: "https://besharamcode-old.netlify.app/Assets/fallback_avtar.png",
    },
    gender: {
      type: String,
      default: "Prefer not to say",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

// Method for Hashing user password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// method for check is user password correct or not
userSchema.methods.isCorrectPassword = async function (password) {
  if (password) {
    console.log(bcrypt.compareSync(password, this.password));
    return await bcrypt.compare(password, this.password);
  }
};

// method for generating user AccessToken
userSchema.methods.generateAccessToken = function () {
  const payload = {
    userId: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
  };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: Date.now() + 24 * 60 * 60 * 1000,
  });
  return accessToken;
};

// method for generating user Refresh token
userSchema.methods.generateRefreshToken = function () {
  const payload = {
    userId: this._id,
  };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: Date.now() + 10 * 24 * 60 * 60 * 1000,
  });
  return refreshToken;
};

// user model
export const User = mongoose.model("User", userSchema);
