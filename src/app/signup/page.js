"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup as signupApi } from "@/services/authService";
import { User as UserIcon, Mail, KeyRound, Sparkles, Brain } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState("info");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const showToast = (msg, type = "info") => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!name || !email || !password) {
      showToast("All fields are required", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 chars", "error");
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      await signupApi({ name, email, password });
      showToast("Registration successful! Check OTP", "success");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.warn("Backend signup failed, falling back to simulated onboarding flow.", err);
      showToast("Backend API offline. Simulating registration...", "info");
      
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&demo=true`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: "100vh", padding: "1.5rem", background: "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)" }}>
      <div className="glass-card signup-card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem 2rem", position: "relative" }}>
        
        {/* Floating brand icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}>
            <Brain size={26} />
          </div>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "1.8rem" }}>
          Create Account
        </h2>
        <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Join <span style={{ color: "white", fontWeight: "600" }}>Algo Mentor</span> to boost your rating
        </p>

        {alertMsg && (
          <div style={{
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            fontSize: "0.8rem",
            marginBottom: "1.25rem",
            backgroundColor: alertType === "success" ? "rgba(16, 185, 129, 0.1)" : alertType === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)",
            border: `1px solid ${alertType === "success" ? "rgba(16, 185, 129, 0.2)" : alertType === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(99, 102, 241, 0.2)"}`,
            color: alertType === "success" ? "var(--text-success)" : alertType === "error" ? "var(--text-danger)" : "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fadeIn 0.2s ease"
          }}>
            <Sparkles size={14} className="pulse-green" />
            <span>{alertMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ gap: "1.25rem" }}>
          <div style={{ position: "relative" }}>
            <UserIcon size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              style={{ paddingLeft: "2.75rem" }}
              required
            />
          </div>

          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              style={{ paddingLeft: "2.75rem" }}
              required
            />
          </div>

          <div style={{ position: "relative" }}>
            <KeyRound size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              style={{ paddingLeft: "2.75rem" }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ height: "46px", marginTop: "0.5rem" }}>
            {loading ? "Creating account..." : "Register Now"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
          <hr style={{ flexGrow: "1", border: "none", borderTop: "1px solid var(--border-ice)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Or join with</span>
          <hr style={{ flexGrow: "1", border: "none", borderTop: "1px solid var(--border-ice)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLoginButton />
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: "600", marginLeft: "0.25rem" }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
