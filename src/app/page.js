"use client";

import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import "./Landing.css";

export default function Landing() {
  const router = useRouter();

  return (
    <div style={{ 
      backgroundColor: "#060913", 
      color: "var(--text-primary)", 
      minHeight: "100vh", 
      overflowX: "hidden", 
      position: "relative",
      display: "flex",
      flexDirection: "column"
    }}>
      
      {/* Background Glow Orbs */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)", top: "-100px", left: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)", top: "400px", right: "-100px", pointerEvents: "none" }} />

      {/* Header / Navbar */}
      <nav style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "1.5rem 2rem", 
        maxWidth: "1200px", 
        width: "100%",
        margin: "0 auto", 
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <Brain size={18} />
          </div>
          <span style={{ fontFamily: "var(--font-title)", fontWeight: "800", fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Algo Mentor</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push("/login")} style={{ padding: "0.5rem 1.25rem" }}>
            Login
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/register")} style={{ padding: "0.5rem 1.25rem" }}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "1200px", 
        width: "100%",
        margin: "0 auto", 
        padding: "6rem 2rem 8rem", 
        textAlign: "center",
        position: "relative",
        zIndex: 10
      }}>
        
        {/* Floating Tag */}
        <div className="floating-anim" style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "0.35rem 1rem", 
          borderRadius: "20px", 
          background: "rgba(99, 102, 241, 0.08)", 
          border: "1px solid rgba(99, 102, 241, 0.15)", 
          fontSize: "0.75rem", 
          fontWeight: "600", 
          color: "var(--primary-light)", 
          marginBottom: "2rem" 
        }}>
          <span>Next-Generation Competitive Programming Hub</span>
        </div>

        <h1 style={{ 
          fontSize: "3.8rem", 
          fontWeight: "800", 
          lineHeight: "1.15", 
          letterSpacing: "-0.03em", 
          maxWidth: "900px", 
          margin: "0 auto 1.5rem" 
        }}>
          Accelerate Your Coding Journey with <span className="glow-text">AI & Deep Analytics</span>
        </h1>
        
        <p style={{ 
          fontSize: "1.2rem", 
          color: "var(--text-secondary)", 
          maxWidth: "700px", 
          margin: "0 auto 2.5rem", 
          lineHeight: "1.6" 
        }}>
          A unified, AI-powered developer command center for LeetCode and Codeforces to track performance, schedule contests, and optimize complexity.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => router.push("/login")} style={{ padding: "0.9rem 2.25rem", fontSize: "0.95rem" }}>
            <span>Login</span>
          </button>
          <button className="btn btn-secondary" onClick={() => router.push("/register")} style={{ padding: "0.9rem 2.25rem", fontSize: "0.95rem" }}>
            <span>Sign Up</span>
          </button>
        </div>

      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: "1px solid rgba(255,255,255,0.03)", 
        padding: "2rem", 
        textAlign: "center", 
        fontSize: "0.8rem", 
        color: "var(--text-muted)", 
        display: "flex", 
        justifyContent: "space-between", 
        maxWidth: "1200px", 
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 10
      }}>
        <span>© 2026 Algo Mentor. All rights reserved. Created for Competitive Solvers.</span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </footer>

    </div>
  );
}
