"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup as signupApi, verifyOtp, resendOtp } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { KeyRound, Mail, User, Brain, ShieldAlert } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import "../login/Login.css";

export default function Register() {
  const [step, setStep] = useState("signup"); // "signup" or "otp"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [resendStatus, setResendStatus] = useState(null); // success or error message

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await signupApi(form);
      if (res.success) {
        setStep("otp");
      } else {
        setErrorMsg(res.message || "Failed to sign up.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMsg(
        err.response?.data?.message || 
        err.message || 
        "Failed to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await verifyOtp({
        email: form.email,
        otp: otp.trim(),
      });
      if (res.success && res.accessToken) {
        login(res.accessToken);
        router.push("/dashboard");
      } else {
        setErrorMsg(res.message || "Invalid OTP code.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMsg(
        err.response?.data?.message || 
        err.message || 
        "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendStatus("Sending...");
    try {
      const res = await resendOtp({ email: form.email });
      if (res.success) {
        setResendStatus("New OTP sent successfully!");
        setTimeout(() => setResendStatus(null), 3000);
      } else {
        setResendStatus("Failed to resend. Try again.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setResendStatus(err.response?.data?.message || "Error resending OTP.");
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: "100vh", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem", 
      background: "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)" 
    }}>
      <div className="glass-card login-card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem 2rem", position: "relative" }}>
        
        {/* Floating brand icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}>
            <Brain size={26} />
          </div>
        </div>

        {step === "signup" ? (
          <>
            <h2 style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "1.8rem" }}>
              Create Account
            </h2>
            <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Start tracking and improving with <span style={{ color: "white", fontWeight: "600" }}>Algo Mentor</span>
            </p>

            {errorMsg && (
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.8rem",
                marginBottom: "1.25rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "var(--text-danger)",
              }}>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  style={{ paddingLeft: "2.75rem" }}
                  autoComplete="off"
                  required
                />
              </div>

              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  style={{ paddingLeft: "2.75rem" }}
                  autoComplete="off"
                  required
                />
              </div>

              <div style={{ position: "relative" }}>
                <KeyRound size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingLeft: "2.75rem" }}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ height: "46px", marginTop: "0.5rem", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--text-muted)" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
              <span style={{ padding: "0 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>or continue with</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
            </div>

            <GoogleLoginButton width={376} />

            <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: "600", marginLeft: "0.25rem" }}
              >
                Log in
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "1.8rem" }}>
              Verify Your Email
            </h2>
            <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              We've sent a 6-digit OTP code to <span style={{ color: "white", fontWeight: "600" }}>{form.email}</span>
            </p>

            {errorMsg && (
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.8rem",
                marginBottom: "1.25rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "var(--text-danger)",
              }}>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ position: "relative" }}>
                <KeyRound size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ paddingLeft: "2.75rem", letterSpacing: "0.1em", fontWeight: "600", textAlign: "center" }}
                  maxLength={6}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ height: "46px", marginTop: "0.5rem", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
                {loading ? "Verifying..." : "Verify & Log In"}
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
              <button 
                type="button" 
                onClick={() => setStep("signup")} 
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
              >
                Change Email
              </button>
              
              <button 
                type="button" 
                onClick={handleResendOtp}
                style={{ background: "none", border: "none", color: "var(--primary-light)", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
              >
                Resend OTP
              </button>
            </div>

            {resendStatus && (
              <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.75rem", color: resendStatus.includes("success") ? "var(--text-success)" : "var(--text-warning)" }}>
                {resendStatus}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
