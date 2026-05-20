"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/authService";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword({ email });
      alert("OTP sent to your email");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card forgot-card">
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-text">
          Enter your registered email to receive OTP
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
