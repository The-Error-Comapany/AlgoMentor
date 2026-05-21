"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Terminal, Brain, Sparkles, Code, Cpu, Award, Zap, Compass, ChevronRight, Check, Calendar } from "lucide-react";
import "./Landing.css";

function Landing() {
  const router = useRouter();
  const { login } = useAuth();

  const handleDemoMode = () => {
    login("demo-token-active-session");
    router.push("/dashboard");
  };

  return (
    <div style={{ backgroundColor: "#060913", color: "var(--text-primary)", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      
      {/* Background Glow Orbs */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)", top: "-100px", left: "10%" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)", top: "400px", right: "-100px" }} />

      {/* Header / Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", maxWidth: "1200px", margin: "0 auto", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <Brain size={18} />
          </div>
          <span style={{ fontFamily: "var(--font-title)", fontWeight: "800", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Algo Mentor</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push("/login")} style={{ padding: "0.5rem 1.25rem" }}>
            Login
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDemoMode} style={{ padding: "0.5rem 1.25rem" }}>
            <Sparkles size={14} />
            Explore Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        
        {/* Floating Tag */}
        <div className="floating-anim" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 1rem", borderRadius: "20px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", fontSize: "0.75rem", fontWeight: "600", color: "var(--primary-light)", marginBottom: "2rem" }}>
          <Sparkles size={12} className="pulse-green" />
          <span>Next-Generation Competitive Programming Hub</span>
        </div>

        <h1 style={{ fontSize: "3.5rem", fontWeight: "800", lineHeight: "1.15", letterSpacing: "-0.03em", maxWidth: "900px", margin: "0 auto 1.5rem" }}>
          Accelerate Your Coding Journey with <span className="glow-text">AI & Deep Analytics</span>
        </h1>
        
        <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", maxWidth: "700px", margin: "0 auto 2.5rem", lineHeight: "1.6" }}>
          A unified developer command center for <span style={{ color: "white", fontWeight: "600" }}>LeetCode</span> and <span style={{ color: "white", fontWeight: "600" }}>Codeforces</span>. Review complexity instantly, visualize study roadmaps, and track platform insights.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "5rem" }}>
          <button className="btn btn-primary" onClick={handleDemoMode} style={{ padding: "0.9rem 2.25rem", fontSize: "0.95rem" }}>
            <span>Enter Demo Command Center</span>
            <ChevronRight size={18} />
          </button>
          <button className="btn btn-secondary" onClick={() => router.push("/signup")} style={{ padding: "0.9rem 2.25rem", fontSize: "0.95rem" }}>
            <span>Create Free Account</span>
          </button>
        </div>

        {/* Live Interactive CSS Dashboard Mockup */}
        <div className="glass-card" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0.5rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 50px rgba(99, 102, 241, 0.1)", background: "rgba(10, 14, 25, 0.95)", overflow: "hidden" }}>
          
          {/* Mock Browser Header */}
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", padding: "0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.2rem 4rem", borderRadius: "6px", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", border: "1px solid rgba(255,255,255,0.04)" }}>
              algomentor.dev/dashboard
            </div>
            <div style={{ width: "30px" }} />
          </div>

          {/* Mock Dashboard Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: "450px", textAlign: "left" }}>
            
            {/* Mock Sidebar */}
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.04)", padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: "6px", background: "rgba(13, 18, 32, 0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", marginBottom: "0.5rem" }}>
                <Brain size={14} style={{ color: "var(--primary-light)" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>Algo Mentor</span>
              </div>
              <div style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "var(--primary-gradient)", fontSize: "0.75rem", fontWeight: "600", color: "white" }}>Dashboard</div>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>Problems Library</div>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>Contest Calendar</div>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>Problem of the Day</div>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyBetween: "space-between", display: "flex", justifyContent: "space-between" }}>
                <span>AI Mentor Chat</span>
                <span style={{ background: "rgba(139,92,246,0.15)", color: "var(--text-warning)", fontSize: "0.6rem", padding: "0.05rem 0.35rem", borderRadius: "4px" }}>Beta</span>
              </div>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>Analytics Profile</div>
            </div>

            {/* Mock Dashboard Content */}
            <div style={{ padding: "1.5rem", overflowY: "hidden", display: "flex", flexDirection: "column", gap: "1.25rem", background: "#0b0f19" }}>
              
              {/* Header inside mockup */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "1.1rem", margin: "0" }}>Hey Aishvary 👋</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0" }}>You've solved 342 problems this week! Level Up is near.</p>
                </div>
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "20px", padding: "0.25rem 0.75rem", fontSize: "0.7rem", color: "var(--text-success)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse-glowing 2s infinite" }} />
                  Chrome Extension Connected
                </div>
              </div>

              {/* Grid 4 Stats inside mockup */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-ice)", borderRadius: "10px", padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Total Solved</span>
                  <h5 style={{ fontSize: "1.2rem", margin: "2px 0 0" }}>843 <span style={{ fontSize: "0.65rem", color: "var(--text-success)" }}>+12%</span></h5>
                </div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-ice)", borderRadius: "10px", padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>LeetCode Rating</span>
                  <h5 style={{ fontSize: "1.2rem", margin: "2px 0 0", color: "#ffa116" }}>1942</h5>
                </div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-ice)", borderRadius: "10px", padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Codeforces Rating</span>
                  <h5 style={{ fontSize: "1.2rem", margin: "2px 0 0", color: "#318dec" }}>1684 <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", fontWeight: "400" }}>Exp</span></h5>
                </div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-ice)", borderRadius: "10px", padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Current Streak</span>
                  <h5 style={{ fontSize: "1.2rem", margin: "2px 0 0", color: "var(--text-danger)" }}>18 Days 🔥</h5>
                </div>
              </div>

              {/* Lower split mockup */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "1rem" }}>
                
                {/* Topic health inside mockup */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-ice)", borderRadius: "10px", padding: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>Topic Health Assessment</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Computed via API</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", marginBottom: "2px" }}>
                        <span>Arrays & Hashing (92%)</span>
                        <span style={{ color: "var(--text-success)" }}>Master</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: "92%", background: "var(--emerald-gradient)", borderRadius: "2px" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", marginBottom: "2px" }}>
                        <span>Tree & Graphs (78%)</span>
                        <span style={{ color: "var(--text-info)" }}>Strong</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: "78%", background: "var(--primary-gradient)", borderRadius: "2px" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", marginBottom: "2px" }}>
                        <span>Dynamic Programming (30%)</span>
                        <span style={{ color: "var(--text-danger)" }}>Weak</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: "30%", background: "linear-gradient(90deg, #ef4444, #f59e0b)", borderRadius: "2px" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation inside mockup */}
                <div style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "10px", padding: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Sparkles size={12} style={{ color: "var(--text-warning)" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>AI Recommended Path</span>
                  </div>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", margin: "0", lineHeight: "1.4" }}>
                    Based on your low DP rate, you should try <span style={{ color: "white", fontWeight: "600" }}>Sliding Window problems</span> followed by Memoization.
                  </p>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.65rem", marginTop: "auto", border: "1px solid rgba(255,255,255,0.05)", display: "inline-block", textAlign: "center" }}>
                    Launch Roadmap
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Metrics Strips */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.03)", background: "rgba(13,18,32,0.3)", padding: "2.5rem 0" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", textAlign: "center" }}>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "white", marginBottom: "0.25rem" }}>12,482</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Members</span>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "white", marginBottom: "0.25rem" }}>1.2M+</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Submissions Synced</span>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "white", marginBottom: "0.25rem" }}>4,380+</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contests Scheduled</span>
          </div>
        </div>
      </section>

      {/* Features Detail Grid */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "6rem 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: "800", marginBottom: "1rem" }}>
          A Suite Crafted for Competitive Coders
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 4rem" }}>
          Everything you need to master algos, sync handles, schedule contests, and analyze complexity.
        </p>

        <div className="grid-3">
          
          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)" }}>
              <LayoutDashboard size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>Command Center</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Say goodbye to switching tabs. Track your rating, solved list, active streaks, and upcoming events in one unified screen.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-color)" }}>
              <Brain size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>AI Mentor bot</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              A specialized chat assistant trained on your DSA history. Know exactly what to study next, review algorithms, or paste code for review.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-success)" }}>
              <Code size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>Chrome Extension Overlay</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Inject overlays right on LeetCode. Analyze time/space complexity upon submission and auto-sync analyses to your history vault.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-warning)" }}>
              <Compass size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>AI Study Roadmap</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Never wonder what problems to solve next. Follow an adaptive learning path that updates dynamically as you solve DP, Trees, or Arrays.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(14, 165, 233, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-info)" }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>Contest Calendar & Reminders</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Never miss a contest again. Toggle calendar views, receive countdown alerts, and schedule notifications locally with one click.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-danger)" }}>
              <Award size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>Topic Health Diagnostics</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Detailed diagnostics broken down by algorithm categories. Pinpoint weaknesses and track mastery rating changes over time.
            </p>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ maxWidth: "900px", margin: "0 auto 6rem", padding: "4rem 2rem", borderRadius: "24px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)", border: "1px solid rgba(99, 102, 241, 0.2)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        
        <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.15)", filter: "blur(50px)", bottom: "-50px", right: "-50px" }} />
        
        <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}>Ready to Unleash Your Coding Potential?</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "550px", margin: "0 auto 2rem", fontSize: "0.95rem" }}>
          Gain access to full analytical monitoring, code evaluation histories, customized AI studies, and sync all your platforms today.
        </p>
        <button className="btn btn-primary" onClick={handleDemoMode} style={{ padding: "0.85rem 2rem" }}>
          <Sparkles size={16} />
          <span>Launch Free Demo Session</span>
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.03)", padding: "2rem", textAlignment: "center", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto" }}>
        <span>© 2026 Algo Mentor. All rights reserved. Created for Competitive Solvers.</span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Chrome Web Store</span>
        </div>
      </footer>

    </div>
  );
}

const LayoutDashboard = ({ size }) => <Terminal size={size} />;

export default Landing;
