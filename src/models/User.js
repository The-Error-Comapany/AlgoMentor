import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // required only if NOT Google user
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpires: Date,

    googleId: {
      type: String,
      default: null,
    },
    lcHandle: {
      type: String,
      default: "",
    },
    cfHandle: {
      type: String,
      default: "",
    },
    weeklyGoalTarget: {
      type: Number,
      default: 10,
    },
    readAchievements: {
      type: [String],
      default: [],
    },
    readContests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ---------------- PASSWORD HASHING ----------------
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------- COMPARE PASSWORD ----------------
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;

  return await bcrypt.compare(enteredPassword, this.password);
};

// ---------------- MODEL ----------------
// Prevent compilation errors on hot reload in Next.js
// Add partial TTL index for unverified users
userSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 24 * 60 * 60, // 24 hours in seconds
    partialFilterExpression: { isEmailVerified: false }
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
