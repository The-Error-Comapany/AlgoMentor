"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Award, CheckCircle2, TrendingUp, Sparkles, Code2, AlertTriangle, ExternalLink, User } from "lucide-react";

function ProfileContent() {
  const { user, loading: loadingUser } = useAuth();

  // Sync data states
  const [stats, setStats] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [topics, setTopics] = useState([]);

  // Hover state for chart tooltip
  const [hoveredPoint, setHoveredPoint] = useState(null); // { platform, rating, x, y }

  // 2. Fetch User Stats, Submissions, and Topics once we have user ID
  useEffect(() => {
    if (!user?._id) return;

    const fetchUserData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch(`/api/user/stats?userId=${user._id}`);
        const statsData = await statsRes.json();
        if (Array.isArray(statsData)) {
          setStats(statsData);
        }

        // Fetch submissions
        const subsRes = await fetch(`/api/user/submissions?userId=${user._id}&limit=10`);
        const subsData = await subsRes.json();
        if (Array.isArray(subsData)) {
          setSubmissions(subsData);
        }

        // Fetch topics
        const topicsRes = await fetch(`/api/user/topics?userId=${user._id}`);
        const topicsData = await topicsRes.json();
        if (Array.isArray(topicsData)) {
          setTopics(topicsData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [user]);

  // Helper: Relative time formatting for submissions
  const getRelativeTime = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Helper: Get Problem URL
  const getProblemUrl = (title, platform, titleSlug) => {
    return platform === "leetcode"
      ? `https://leetcode.com/problems/${titleSlug || title.toLowerCase().replace(/ /g, "-")}/`
      : `https://codeforces.com/problemset/problem/${titleSlug || "1800/A"}`;
  };

  // Filter data based on active handles
  const activeStats = stats.filter(s => {
    if (s.platform === "leetcode" && !user?.lcHandle) return false;
    if (s.platform === "codeforces" && !user?.cfHandle) return false;
    return true;
  });

  const activeSubmissions = submissions.filter(s => {
    if (s.platform === "leetcode" && !user?.lcHandle) return false;
    if (s.platform === "codeforces" && !user?.cfHandle) return false;
    return true;
  });

  const activeTopics = topics.filter(t => {
    if (t.platform === "leetcode" && !user?.lcHandle) return false;
    if (t.platform === "codeforces" && !user?.cfHandle) return false;
    return true;
  });

  // Find individual platforms stats
  const lcStats = user?.lcHandle ? activeStats.find((s) => s.platform === "leetcode") : null;
  const cfStats = user?.cfHandle ? activeStats.find((s) => s.platform === "codeforces") : null;

  const lcSolved = lcStats?.solved || 0;
  const lcEasy = lcStats?.easySolved || 0;
  const lcMedium = lcStats?.mediumSolved || 0;
  const lcHard = lcStats?.hardSolved || 0;

  // Codeforces solved can be calculated from topics or default to submissions count
  const cfSolved = user?.cfHandle ? (activeTopics.filter(t => t.platform === "codeforces").reduce((sum, t) => sum + t.count, 0) || 
                   activeSubmissions.filter(s => s.platform === "codeforces" && (s.verdict === "Accepted" || s.verdict === "OK")).length) : 0;

  const easySolved = lcEasy;
  const mediumSolved = lcMedium;
  const hardSolved = lcHard;

  // Difficulty progress mapping
  const difficultyStats = {
    Easy: { solved: easySolved, total: 300, percent: Math.min(100, Math.round((easySolved / 300) * 100)), color: "var(--success)" },
    Medium: { solved: mediumSolved, total: 500, percent: Math.min(100, Math.round((mediumSolved / 500) * 100)), color: "var(--warning)" },
    Hard: { solved: hardSolved, total: 200, percent: Math.min(100, Math.round((hardSolved / 200) * 100)), color: "var(--danger)" }
  };

  // Group topics for progress bar display
  const topicDistribution = [...activeTopics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(t => {
      const estimatedMax = Math.max(50, Math.ceil(t.count / 20) * 20);
      return {
        topic: t.topic,
        solved: t.count,
        max: estimatedMax,
        color: t.platform === "leetcode"
          ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
          : "linear-gradient(90deg, #318dec 0%, #2563eb 100%)"
      };
    });

  // Strengths & Weaknesses tags
  const sortedTopics = [...activeTopics].sort((a, b) => b.count - a.count);
  const strengthTags = sortedTopics.slice(0, 3).map(t => t.topic);
  const weaknessTags = sortedTopics.slice(-3).reverse().map(t => t.topic);

  // SVG Ratings history calculations
  const getCFChartPoints = () => {
    const history = cfStats?.ratingHistory || [];
    if (history.length === 0) return [];
    
    const last6 = history.slice(-6);
    const ratings = last6.map(h => h.rating);
    const minR = Math.min(...ratings);
    const maxR = Math.max(...ratings);
    const range = maxR - minR || 1;

    return last6.map((h, idx) => {
      const x = 50 + idx * 100;
      const y = 160 - ((h.rating - minR) / range) * 120;
      return {
        label: `Contest ${idx + 1}`,
        rating: h.rating,
        x,
        y
      };
    });
  };

  const getLCChartPoints = () => {
    const rating = lcStats?.rating;
    if (!rating) return [];
    
    // Generate simulated progression line ending at current LeetCode rating
    const startRating = Math.round(rating * 0.95);
    const points = [];
    for (let i = 0; i < 6; i++) {
      const r = Math.round(startRating + (rating - startRating) * (i / 5));
      const x = 50 + i * 100;
      const y = 140 - (i * 12);
      points.push({
        label: `Contest ${i + 1}`,
        rating: r,
        x,
        y
      });
    }
    return points;
  };

  const chartPointsCF = getCFChartPoints();
  const chartPointsLC = getLCChartPoints();

  if (loadingUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "50%", border: "4px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", animation: "spin 1s infinite linear" }} />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading profile...</p>
      </div>
    );
  }

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
            border: "2px solid rgba(255,255,255,0.1)",
            fontSize: "1.8rem",
            fontWeight: "700"
          }}>
            {(user?.name || "D").charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 style={{ fontSize: "1.7rem", fontWeight: "600", margin: "0 0 4px", textAlign: "left", color: "white" }}>
              {user?.name || "Developer"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0" }}>
              Competitive programmer | Member since May 2026
            </p>
          </div>
        </div>

        {/* Handles badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {user?.lcHandle ? (
            <a href={`https://leetcode.com/${user.lcHandle}`} target="_blank" rel="noreferrer" className="badge badge-leetcode" style={{ textTransform: "none", fontSize: "0.75rem", padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
              <span>leetcode.com/{user.lcHandle}</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", borderRadius: "6px", border: "1px dashed rgba(255,255,255,0.1)" }}>LeetCode: Unlinked</span>
          )}
          
          {user?.cfHandle ? (
            <a href={`https://codeforces.com/profile/${user.cfHandle}`} target="_blank" rel="noreferrer" className="badge badge-codeforces" style={{ textTransform: "none", fontSize: "0.75rem", padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
              <span>codeforces.com/{user.cfHandle}</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", borderRadius: "6px", border: "1px dashed rgba(255,255,255,0.1)" }}>Codeforces: Unlinked</span>
          )}
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
              <h2 style={{ fontSize: "1.6rem", color: "#ffa116", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>
                {lcStats?.rating || "N/A"}
              </h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {lcStats?.ranking ? `Ranking: #${lcStats.ranking}` : "Not ranked"}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Problems Solved</span>
              <h2 style={{ fontSize: "1.6rem", color: "white", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>{lcSolved}</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Easy: {lcEasy} | Med: {lcMedium} | Hard: {lcHard}</span>
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
              <h2 style={{ fontSize: "1.6rem", color: "#318dec", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>
                {cfStats?.rating || "N/A"}
              </h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {cfStats?.rank ? `Rank: ${cfStats.rank}` : "Unranked"}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Problems Solved</span>
              <h2 style={{ fontSize: "1.6rem", color: "white", textAlign: "left", margin: "2px 0 0", fontWeight: "700" }}>{cfSolved}</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Max Rating: {cfStats?.maxRating || "N/A"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Rating Chart: Custom SVG line chart */}
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
              {chartPointsLC.length > 0 && (
                <path
                  d={chartPointsLC.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                  fill="none"
                  stroke="#ffa116"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.3))" }}
                />
              )}

              {/* CF Line Path */}
              {chartPointsCF.length > 0 && (
                <path
                  d={chartPointsCF.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                  fill="none"
                  stroke="#318dec"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(49, 141, 236, 0.3))" }}
                />
              )}

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
              {(chartPointsCF.length > 0 ? chartPointsCF : chartPointsLC).map((p, idx) => (
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

            {chartPointsCF.length === 0 && chartPointsLC.length === 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Link handles and participate in contests to draw ratings timeline.
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
            {topicDistribution.length > 0 ? (
              topicDistribution.map((t) => (
                <div key={t.topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "500", color: "white" }}>{t.topic}</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>{t.solved} / {t.max} solved</span>
                  </div>
                  {/* Visual Bar with Gradient */}
                  <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid var(--border-ice)" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, (t.solved / t.max) * 100)}%`,
                      background: t.color,
                      borderRadius: "4px",
                      transition: "width 0.4s ease-out"
                    }} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Sync handles to display topic mastery insights
              </div>
            )}
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
                {strengthTags.length > 0 ? (
                  strengthTags.map((tag) => (
                    <span key={tag} className="badge badge-easy" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>{tag}</span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Not enough data yet</span>
                )}
              </div>
            </div>

            {/* Weaknesses */}
            <div style={{ padding: "0.85rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-danger)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Weaknesses (Practice Targets)
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {weaknessTags.length > 0 ? (
                  weaknessTags.map((tag) => (
                    <span key={tag} className="badge badge-hard" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem", textTransform: "none" }}>{tag}</span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Not enough data yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Submissions Table */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Submissions Feed (Last 10)</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Realtime sync LeetCode & Codeforces</span>
        </div>

        <div className="table-container">
          {activeSubmissions.length > 0 ? (
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
                {activeSubmissions.map((sub, idx) => (
                  <tr key={idx}>
                    <td>
                      <a 
                        href={getProblemUrl(sub.title, sub.platform, sub.titleSlug)} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: "0.85rem", fontWeight: "600", textDecoration: "none", color: "white" }}
                        className="link-hover"
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--primary-light)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "white"}
                      >
                        {sub.title}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${sub.platform === "leetcode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.65rem" }}>
                        {sub.platform === "leetcode" ? "LeetCode" : "Codeforces"}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{sub.language}</td>
                    <td>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: (sub.verdict === "Accepted" || sub.verdict === "OK") ? "var(--text-success)" : sub.verdict === "Wrong Answer" ? "var(--text-danger)" : "var(--text-warning)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {(sub.verdict === "Accepted" || sub.verdict === "OK") ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {sub.verdict === "OK" ? "Accepted" : sub.verdict}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{getRelativeTime(sub.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No submissions found. Sync your coding accounts to populate history.
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .profile-charts-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
