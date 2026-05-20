"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import "./VerifyOtp.css";

function VerifyOtpContent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await verifyOtp({ email, otp });

      // Save token globally & locally
      login(res.accessToken);
      router.push("/home");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    try {
      await resendOtp({ email });
      alert("OTP resent successfully!");
    } catch (err) {
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
      <div className="card verify-card">
        <h2 className="verify-title">Verify OTP</h2>
        <p className="verify-text">
          Enter the OTP sent to <b>{email}</b>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="resend-text">
          Didn’t receive OTP?{" "}
          <span className="resend-btn" onClick={handleResendOtp}>
            {resendLoading ? "Sending..." : "Resend OTP"}
          </span>
        </p>
      </div>
    </div>
  );
}

function VerifyOtp() {
  return (
    <Suspense fallback={<div className="container"><p>Loading...</p></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}

export default VerifyOtp;
