"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, resendOtp } from "@/services/authService";
import "./ResetPassword.css";

function ResetPasswordContent() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  // 🔹 RESET PASSWORD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword({
        email,
        otp,
        newPassword,
      });

      alert("Password reset successful. Please login.");
      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Reset password failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 RESEND OTP
  const handleResendOtp = async () => {
    setResendLoading(true);

    try {
      await resendOtp({ email });
      alert("OTP resent successfully!");
    } catch (err) {
      console.log("RESEND OTP ERROR 👉", err.response);
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return <h3>Invalid access</h3>;
  }

  return (
    <div className="container">
      <div className="card reset-card">
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="resend-text">
          Didn’t receive OTP?{" "}
          <span onClick={handleResendOtp} className="resend-btn">
            {resendLoading ? "Sending..." : "Resend OTP"}
          </span>
        </p>
      </div>
    </div>
  );
}

function ResetPassword() {
  return (
    <Suspense fallback={<div className="container"><p>Loading...</p></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

export default ResetPassword;
