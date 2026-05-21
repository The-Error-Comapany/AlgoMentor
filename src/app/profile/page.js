"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Award, CheckCircle2, TrendingUp, Sparkles, Code2, AlertTriangle, Calendar, ExternalLink } from "lucide-react";

function ProfileContent() {
  // Chart interaction state
  const [hoveredDiff, setHoveredDiff] = useState(null); // null | 'Easy' | 'Medium' | 'Hard'

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

  const contestHistory = [
    { name: "Codeforces Round 997 (Div 2)", date: "May 15, 2026", rank: "482", solved: "4/6", ratingChange: "+45", performance: "Expert" },
    { name: "LeetCode Weekly 431", date: "May 10, 2026", rank: "128", solved: "4/4", ratingChange: "+18", performance: "Guardian" },
    { name: "Codeforces Round 996 (Div 2)", date: "May 04, 2026", rank: "1028", solved: "3/6", ratingChange: "-12", performance: "Specialist" },
    { name: "LeetCode Weekly 430", date: "Apr 26, 2026", rank: "82", solved: "4/4", ratingChange: "+32", performance: "Guardian" },
    { name: "Codeforces Educational 164", date: "Apr 20, 2026", rank: "342", solved: "5/6", ratingChange: "+84", performance: "Expert" }
  ];

  const recentSubmissions = [
    { title: "Edit Distance", platform: "LeetCode", verdict: "Accepted", lang: "C++", time: "10 mins ago" },
    { title: "Divisibility by 2^n", platform: "Codeforces", verdict: "Time Limit Exceeded", lang: "C++", time: "45 mins ago" },
    { title: "Binary Tree Maximum Path Sum", platform: "LeetCode", verdict: "Accepted", lang: "Java", time: "3 hours ago" },
    { title: "Valid Parentheses", platform: "LeetCode", verdict: "Accepted", lang: "Python", time: "Yesterday" }
  ];

  // Donut chart calculations
  const totalSolved = 843;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16

  // Accumulated dasharrays
  const easyDash = (circumference * 37) / 100;
  const mediumDash = (circumference * 51) / 100;
  const hardDash = (circumference * 12) / 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Platform Cards Overview */}
      <div className="grid-3">
        
        {/* LeetCode Card */}
        <div className="glass-card" style={{ borderLeft: "4px solid #ffa116", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="badge badge-leetcode">Leetcode Profile</span>
            <Award size={18} style={{ color: "#ffa116" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Platform Rating</span>
            <h2 style={{ fontSize: "1.6rem", color: "#ffa116", textAlign: "left", margin: "2px 0 0" }}>1,942</h2>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Rank: #14,284 (Guardian)</span>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Problems Solved</span>
            <span style={{ color: "white", fontWeight: "600" }}>638 / 1200</span>
          </div>
        </div>

        {/* Codeforces Card */}
        <div className="glass-card" style={{ borderLeft: "4px solid #318dec", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="badge badge-codeforces">Codeforces Profile</span>
            <Award size={18} style={{ color: "#318dec" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Platform Rating</span>
            <h2 style={{ fontSize: "1.6rem", color: "#318dec", textAlign: "left", margin: "2px 0 0" }}>1,684</h2>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Rank: Expert (aishvary_code)</span>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Problems Solved</span>
            <span style={{ color: "white", fontWeight: "600" }}>205 / 500</span>
          </div>
        </div>

        {/* Summary diagnostics */}
        <div className="glass-card" style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)",
          borderColor: "rgba(99, 102, 241, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={16} style={{ color: "var(--text-warning)" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>AI Diagnostic Index</span>
          </div>
          <div style={{ margin: "4px 0" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Overall Mastery Rating</span>
            <h2 style={{ fontSize: "1.6rem", color: "var(--primary-light)", textAlign: "left", margin: "2px 0 0" }}>82.4%</h2>
            <span style={{ fontSize: "0.7rem", color: "var(--text-success)" }}>Highly Proficient (Level 28)</span>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>DSA Coverage Rate</span>
            <span style={{ color: "white", fontWeight: "600" }}>74% of Core Library</span>
          </div>
        </div>

      </div>

      {/* 2. Charts Row: Custom Donut Chart + Horizontal Bar Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }} className="profile-charts-layout">
        
        {/* SVG Donut Chart for Difficulty */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem", alignSelf: "flex-start" }}>Difficulty Distribution</h3>
          
          <div style={{ position: "relative", width: "160px", height: "160px", margin: "1rem 0" }}>
            <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              {/* Easy Arc (37%) */}
              <circle
                r={radius}
                cx="60"
                cy="60"
                fill="transparent"
                stroke="var(--success)"
                strokeWidth="10"
                strokeDasharray={`${easyDash} ${circumference}`}
                strokeDashoffset="0"
                style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
                onMouseEnter={() => setHoveredDiff("Easy")}
                onMouseLeave={() => setHoveredDiff(null)}
                strokeWidth={hoveredDiff === "Easy" ? "13" : "10"}
              />
              
              {/* Medium Arc (51%) */}
              <circle
                r={radius}
                cx="60"
                cy="60"
                fill="transparent"
                stroke="var(--warning)"
                strokeWidth="10"
                strokeDasharray={`${mediumDash} ${circumference}`}
                strokeDashoffset={-easyDash}
                style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
                onMouseEnter={() => setHoveredDiff("Medium")}
                onMouseLeave={() => setHoveredDiff(null)}
                strokeWidth={hoveredDiff === "Medium" ? "13" : "10"}
              />

              {/* Hard Arc (12%) */}
              <circle
                r={radius}
                cx="60"
                cy="60"
                fill="transparent"
                stroke="var(--danger)"
                strokeWidth="10"
                strokeDasharray={`${hardDash} ${circumference}`}
                strokeDashoffset={-(easyDash + mediumDash)}
                style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
                onMouseEnter={() => setHoveredDiff("Hard")}
                onMouseLeave={() => setHoveredDiff(null)}
                strokeWidth={hoveredDiff === "Hard" ? "13" : "10"}
              />
            </svg>

            {/* In-donut Info Box */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                {hoveredDiff ? hoveredDiff : "Total Solved"}
              </span>
              <h4 style={{ fontSize: "1.2rem", margin: "0" }}>
                {hoveredDiff ? difficultyStats[hoveredDiff].solved : totalSolved}
              </h4>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
                {hoveredDiff ? `${difficultyStats[hoveredDiff].percent}% split` : "across platforms"}
              </span>
            </div>
          </div>

          {/* Legend indicators */}
          <div style={{ display: "flex", gap: "1.25rem", width: "100%", justifyContent: "center" }}>
            {Object.keys(difficultyStats).map((d) => {
              const current = difficultyStats[d];
              return (
                <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: current.color }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>{d}</span>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>{current.solved}/{current.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic distribution vertical/horizontal bar chart */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Topic-wise Solved Distribution</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "0.25rem 0" }}>
            {topicDistribution.map((t) => (
              <div key={t.topic}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "500" }}>{t.topic}</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>{t.solved} / {t.max} solved</span>
                </div>
                {/* Visual Bar with Gradient */}
                <div style={{ height: "10px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid var(--border-ice)" }}>
                  <div style={{
                    height: "100%",
                    width: `${(t.solved / t.max) * 100}%`,
                    background: t.color,
                    borderRadius: "4px",
                    boxShadow: "0 0 6px rgba(255, 255, 255, 0.02)",
                    transition: "width 0.4s ease-out"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Strengths & Weaknesses Summary tags */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem" }}>Strengths & Weaknesses Assessment</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="profile-assessment-grid">
          {/* Strengths */}
          <div style={{ padding: "1rem", borderRadius: "12px", background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-success)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Key Strength Areas</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span className="badge badge-easy" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}>Arrays & Hashing (92% Mastery)</span>
              <span className="badge badge-easy" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}>DFS/BFS Tree Search (78% Mastery)</span>
              <span className="badge badge-easy" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}>Prefix Sum (80% Mastery)</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.75rem", lineHeight: "1.4" }}>
              *AI Analysis:* Your speed and accuracy are extremely high on arrays and grid graphs. Standard C++ code optimization handles sub-microsecond runtimes.
            </p>
          </div>

          {/* Weaknesses */}
          <div style={{ padding: "1rem", borderRadius: "12px", background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-danger)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Core Focus Opportunities</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span className="badge badge-hard" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}>Dynamic Programming (30% Solved)</span>
              <span className="badge badge-hard" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}>Recursion Base Cases (25% Optimality)</span>
              <span className="badge badge-hard" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.35rem 0.75rem" }}>DP Memoization (32% Solved)</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.75rem", lineHeight: "1.4" }}>
              *AI Analysis:* You struggle with state transitions and recursion memoization, leading to 38% Time Limit Exceeded (TLE) rates. We strongly suggest starting dynamic programming roadmaps.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Contest History Table */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Contest Performance History</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>LeetCode + Codeforces archives</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Contest</th>
                <th>Date</th>
                <th>Global Rank</th>
                <th>Problems Solved</th>
                <th>Rating Change</th>
                <th>Verdict Performance</th>
              </tr>
            </thead>
            <tbody>
              {contestHistory.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: "600", fontSize: "0.85rem" }}>{item.name}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.date}</td>
                  <td style={{ fontSize: "0.85rem", fontWeight: "700" }}>#{item.rank}</td>
                  <td style={{ fontSize: "0.85rem" }}>{item.solved}</td>
                  <td style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: item.ratingChange.startsWith("+") ? "var(--text-success)" : "var(--text-danger)"
                  }}>
                    {item.ratingChange}
                  </td>
                  <td>
                    <span className={`badge ${item.performance === "Guardian" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.6rem" }}>
                      {item.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Lower Split: Recent Submissions */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem" }}>Submissions Analytics</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }} className="profile-sub-grid">
          {recentSubmissions.map((sub, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1rem", background: "rgba(8,11,17,0.4)", borderRadius: "10px", border: "1px solid var(--border-ice)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
                  <span className={`badge ${sub.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.55rem" }}>
                    {sub.platform}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub.time}</span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{sub.title}</span>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: sub.verdict === "Accepted" ? "var(--text-success)" : "var(--text-danger)",
                  display: "block"
                }}>
                  {sub.verdict}
                </span>
                <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{sub.lang} compilation</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .profile-charts-layout {
            grid-template-columns: 1fr !important;
          }
          .profile-assessment-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-sub-grid {
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
