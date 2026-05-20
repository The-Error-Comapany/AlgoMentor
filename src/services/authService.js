import api from "./api";

// Signup API
export const signup = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

// Verify OTP API
export const verifyOtp = async (data) => {
  const res = await api.post("/auth/verify-otp", data);
  return res.data;
};

// Login API
export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// Logout API
export const logoutApi = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// Forgot password API
export const forgotPassword = async (data) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};

// Reset password API
export const resetPassword = async (data) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

// Google login API
export const googleLogin = async (tokenId) => {
  const res = await api.post("/auth/google", { tokenId });
  return res.data;
};

export const resendOtp = async (data) => {
  const res = await api.post("/auth/resend-otp", data);
  return res.data;
};
