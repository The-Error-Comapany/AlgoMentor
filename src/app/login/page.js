"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { KeyRound, Mail, Brain } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApi(form);
      if (res.success && res.accessToken) {
        login(res.accessToken);
        router.push("/dashboard");
      } else {
        setErrorMsg(res.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(
        err.response?.data?.message || 
        err.message || 
        "Failed to connect to authentication server."
      );
    } finally {
      setLoading(false);
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

        <h2 style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "1.8rem" }}>
          Welcome Back
        </h2>
        <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Sharpen your skills with <span style={{ color: "white", fontWeight: "600" }}>Algo Mentor</span>
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

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              style={{ paddingLeft: "2.75rem" }}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ height: "46px", marginTop: "0.5rem", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--text-muted)" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <span style={{ padding: "0 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
        </div>

        <GoogleLoginButton width={376} />

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: "600", marginLeft: "0.25rem" }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
