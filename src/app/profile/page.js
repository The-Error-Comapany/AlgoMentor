"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Award, CheckCircle2, TrendingUp, Sparkles, Code2, AlertTriangle, ExternalLink, User } from "lucide-react";

function ProfileContent() {
  const [userName, setUserName] = useState("Aishvary");
  const [hoveredPoint, setHoveredPoint] = useState(null); // { platform, rating, x, y }

  // Load user name from registration/settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  const difficultyStats = {
    Easy: { solved: 312, total: 400, percent: 37, color: "var(--success)" },
    Medium: { solved: 432, total: 600, percent: 51, color: "var(--warning)" },
    Hard: { solved: 99, total: 200, percent: 12, color: "var(--danger)" }
  };

  const topicDistribution = [
    { topic: "Arrays & Hashing", solved: 184, max: 200, color: "linear-gradient(90deg, #10b981 0%, #059669 100%)" },
    { topic: "Trees & Graphs", solved: 142, max: 180, color: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)" },
    { topic: "Strings", solved: 95, max: 120, color: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)" },
    { topic: "Math & Bits", solved: 84, max: 100, color: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)" },
    { topic: "Dynamic Programming", solved: 48, max: 150, color: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)" }
  ];

  // Exactly 10 submissions across platforms
  const submissionsHistory = [
    { title: "Edit Distance", platform: "LeetCode", verdict: "Accepted", lang: "C++", time: "10 mins ago" },
    { title: "Divisibility by 2^n", platform: "Codeforces", verdict: "Time Limit Exceeded", lang: "C++", time: "45 mins ago" },
    { title: "Binary Tree Maximum Path Sum", platform: "LeetCode", verdict: "Accepted", lang: "Java", time: "3 hours ago" },
    { title: "Valid Parentheses", platform: "LeetCode", verdict: "Accepted", lang: "Python", time: "Yesterday" },
    { title: "XOR-Construction", platform: "Codeforces", verdict: "Wrong Answer", lang: "C++", time: "2 days ago" },
    { title: "Sliding Window Maximum", platform: "LeetCode", verdict: "Accepted", lang: "C++", time: "3 days ago" },
    { title: "K-th Tree Diameter", platform: "Codeforces", verdict: "Accepted", lang: "C++", time: "4 days ago" },
    { title: "Container With Most Water", platform: "LeetCode", verdict: "Accepted", lang: "Python", time: "5 days ago" },
    { title: "Product of Array Except Self", platform: "LeetCode", verdict: "Accepted", lang: "Java", time: "1 week ago" },
    { title: "Watering Flowers", platform: "Codeforces", verdict: "Accepted", lang: "C++", time: "1 week ago" }
  ];

  // SVG Ratings history double line chart configurations
  const chartPointsLC = [
    { label: "Contest 1", rating: 1800, x: 50, y: 145 },
    { label: "Contest 2", rating: 1832, x: 150, y: 122 },
    { label: "Contest 3", rating: 1864, x: 250, y: 100 },
    { label: "Contest 4", rating: 1882, x: 350, y: 87 },
    { label: "Contest 5", rating: 1914, x: 450, y: 65 },
    { label: "Contest 6", rating: 1942, x: 550, y: 45 }
  ];

  const chartPointsCF = [
    { label: "Contest 1", rating: 1550, x: 50, y: 148 },
    { label: "Contest 2", rating: 1634, x: 150, y: 94 },
    { label: "Contest 3", rating: 1622, x: 250, y: 101 },
    { label: "Contest 4", rating: 1706, x: 350, y: 48 },
    { label: "Contest 5", rating: 1684, x: 450, y: 62 },
    { label: "Contest 6", rating: 1720, x: 550, y: 39 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Dynamic User Header */}
      <div className="glass-card" style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        flexWrap: "wrap",
        gap: "1.5rem", 
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)",
        borderColor: "rgba(99, 102, 241, 0.2)",
        padding: "1.75rem 2rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          {/* Glowing Avatar */}
          <div style={{ 
            width: "68px", 
            height: "68px", 
            borderRadius: "50%", 
            background: "var(--primary-gradient)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "white", 
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
            border: "2px solid rgba(255,255,255,0.1)"
          }}>
            <User size={32} />
          </div>
          
          <div>
            <h2 style={{ fontSize: "1.7rem", fontWeight: "600", margin: "0 0 4px", textAlign: "left", color: "white" }}>
              {userName}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0" }}>
              Competitive programmer | Member since May 2026
            </p>
          </div>
        </div>

        {/* Handles badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="badge badge-leetcode" style={{ textTransform: "none", fontSize: "0.75rem", padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <span>leetcode.com/{userName.toLowerCase()}_code</span>
            <ExternalLink size={12} />
          </a>
          <a href="https://codeforces.com" target="_blank" rel="noreferrer" className="badge badge-codeforces" style={{ textTransform: "none", fontSize: "0.75rem", padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <span>codeforces.com/{userName.toLowerCase()}_code</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 2. Platform Summary Cards */}
      <div className="grid-2">
        
        {/* LeetCode stats */}
        <div className="glass-card" style={{ borderLeft: "4px solid #ffa116", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="badge badge-leetcode">LeetCode Summary</span>
            <Award size={18} style={{ color: "#ffa116" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.25rem" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Platform Rating</span>
              <h2 style={{ fontSize: "1.6rem", color: "#ffa116", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>1,942</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Guardian (Top 4%)</span>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Problems Solved</span>
              <h2 style={{ fontSize: "1.6rem", color: "white", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>638 / 1200</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>DSA Mastery: 74%</span>
            </div>
          </div>
        </div>

        {/* Codeforces stats */}
        <div className="glass-card" style={{ borderLeft: "4px solid #318dec", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="badge badge-codeforces">Codeforces Summary</span>
            <Award size={18} style={{ color: "#318dec" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.25rem" }}>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Platform Rating</span>
              <h2 style={{ fontSize: "1.6rem", color: "#318dec", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>1,684</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Expert Rank</span>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Problems Solved</span>
              <h2 style={{ fontSize: "1.6rem", color: "white", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>205 / 500</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Solve Rate: 41%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Rating Chart: Beautiful custom SVG double-line chart */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", margin: "0" }}>Rating Progression History</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", margin: "4px 0 0" }}>
              Double-line chart visualizing your rating changes over the past 6 contests
            </p>
          </div>
          
          {/* Custom Legend */}
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "3px", backgroundColor: "#ffa116", display: "inline-block" }} />
              <span style={{ color: "var(--text-secondary)" }}>LeetCode</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "3px", backgroundColor: "#318dec", display: "inline-block" }} />
              <span style={{ color: "var(--text-secondary)" }}>Codeforces</span>
            </div>
          </div>
        </div>

        {/* Double-Line SVG Area */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "600px", position: "relative" }}>
            <svg width="100%" height="220" viewBox="0 0 600 200" style={{ overflow: "visible" }}>
              {/* Grid Lines */}
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="30" y1={y} x2="570" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}

              {/* LC Line Path */}
              <path
                d="M 50 145 L 150 122 L 250 100 L 350 87 L 450 65 L 550 45"
                fill="none"
                stroke="#ffa116"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.3))" }}
              />

              {/* CF Line Path */}
              <path
                d="M 50 148 L 150 94 L 250 101 L 350 48 L 450 62 L 550 39"
                fill="none"
                stroke="#318dec"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(49, 141, 236, 0.3))" }}
              />

              {/* LeetCode Interactive Points */}
              {chartPointsLC.map((p, idx) => (
                <circle
                  key={`lc-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#0e1322"
                  stroke="#ffa116"
                  strokeWidth="3.5"
                  style={{ cursor: "pointer", transition: "r 0.15s" }}
                  onMouseEnter={() => setHoveredPoint({ platform: "LeetCode", rating: p.rating, label: p.label, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Codeforces Interactive Points */}
              {chartPointsCF.map((p, idx) => (
                <circle
                  key={`cf-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#0e1322"
                  stroke="#318dec"
                  strokeWidth="3.5"
                  style={{ cursor: "pointer", transition: "r 0.15s" }}
                  onMouseEnter={() => setHoveredPoint({ platform: "Codeforces", rating: p.rating, label: p.label, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* X Axis Labels */}
              {chartPointsLC.map((p, idx) => (
                <text key={`label-${idx}`} x={p.x} y="185" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                  {p.label}
                </text>
              ))}
            </svg>

            {/* Float Tooltip Box */}
            {hoveredPoint && (
              <div style={{
                position: "absolute",
                left: `${(hoveredPoint.x / 600) * 100}%`,
                top: `${hoveredPoint.y - 45}px`,
                transform: "translateX(-50%)",
                background: "var(--bg-darker)",
                border: `1px solid ${hoveredPoint.platform === "LeetCode" ? "#ffa116" : "#318dec"}`,
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "0.7rem",
                color: "white",
                pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                zIndex: 10
              }}>
                <span style={{ fontWeight: "600", color: hoveredPoint.platform === "LeetCode" ? "#ffa116" : "#318dec" }}>
                  {hoveredPoint.platform}
                </span>: {hoveredPoint.rating}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Split Layout: Topic Distribution & Strengths/Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem" }} className="profile-charts-layout">
        
        {/* Topic Distribution Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Topic-wise Solved Distribution</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "0.25rem 0" }}>
            {topicDistribution.map((t) => (
              <div key={t.topic}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "500", color: "white" }}>{t.topic}</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>{t.solved} / {t.max} solved</span>
                </div>
                {/* Visual Bar with Gradient */}
                <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid var(--border-ice)" }}>
                  <div style={{
                    height: "100%",
                    width: `${(t.solved / t.max) * 100}%`,
                    background: t.color,
                    borderRadius: "4px",
                    transition: "width 0.4s ease-out"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Skill Diagnostic Tags</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Strengths */}
            <div style={{ padding: "0.85rem", borderRadius: "10px", background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-success)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Strengths (High Solve Rates)
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="badge badge-easy" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>Arrays & Hashing</span>
                <span className="badge badge-easy" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>BFS/DFS Tree Search</span>
                <span className="badge badge-easy" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>Prefix Sums</span>
              </div>
            </div>

            {/* Weaknesses */}
            <div style={{ padding: "0.85rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-danger)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Weaknesses (Focus Focus)
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="badge badge-hard" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>Dynamic Programming</span>
                <span className="badge badge-hard" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>Recursion Base Cases</span>
                <span className="badge badge-hard" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>State Memoization</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Submissions Table: Exactly 10 submissions */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Submissions Feed (Last 10)</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Realtime sync LeetCode & Codeforces</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Problem Name</th>
                <th>Platform</th>
                <th>Language</th>
                <th>Verdict</th>
                <th>Submitted Time</th>
              </tr>
            </thead>
            <tbody>
              {submissionsHistory.map((sub, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "600", fontSize: "0.85rem" }}>{sub.title}</td>
                  <td>
                    <span className={`badge ${sub.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.65rem" }}>
                      {sub.platform}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{sub.lang}</td>
                  <td>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: sub.verdict === "Accepted" ? "var(--text-success)" : sub.verdict === "Wrong Answer" ? "var(--text-danger)" : "var(--text-warning)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {sub.verdict === "Accepted" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {sub.verdict}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded layout styles */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .profile-charts-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

function Profile() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Profile;
