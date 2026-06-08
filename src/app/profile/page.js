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
  const [topics, setTopics] = useState([]);
  const [animated, setAnimated] = useState(false);



  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch User Stats and Topics once we have user ID
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

  // Filter data based on active handles
  const activeStats = stats.filter(s => {
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

  // Codeforces solved should use the precise totalUniqueSolved calculated by the backend
  const cfSolved = cfStats?.solved || 0;

  const easySolved = lcEasy;
  const mediumSolved = lcMedium;
  const hardSolved = lcHard;

  // Difficulty progress mapping
  const difficultyStats = {
    Easy: { solved: easySolved, total: 300, percent: Math.min(100, Math.round((easySolved / 300) * 100)), color: "var(--success)" },
    Medium: { solved: mediumSolved, total: 500, percent: Math.min(100, Math.round((mediumSolved / 500) * 100)), color: "var(--warning)" },
    Hard: { solved: hardSolved, total: 200, percent: Math.min(100, Math.round((hardSolved / 200) * 100)), color: "var(--danger)" }
  };
  // Map Codeforces specific tags to unified names
  const tagMapping = {
    "math": "Math",
    "greedy": "Greedy",
    "dp": "Dynamic Programming",
    "implementation": "Implementation",
    "data structures": "Data Structures",
    "brute force": "Brute Force",
    "constructive algorithms": "Constructive Algorithms",
    "graphs": "Graph",
    "sortings": "Sorting",
    "binary search": "Binary Search",
    "dfs and similar": "Depth-First Search",
    "trees": "Tree",
    "strings": "String",
    "number theory": "Number Theory",
    "combinatorics": "Combinatorics",
    "geometry": "Geometry",
    "bitmasks": "Bit Manipulation",
    "two pointers": "Two Pointers",
    "dsu": "Union-Find",
    "shortest paths": "Shortest Path"
  };

  // Combine topics from both platforms
  const combinedTopicsMap = {};
  activeTopics.forEach(t => {
    // Check if the topic exists in our mapping, else title case it
    let normalizedName = t.topic;
    if (tagMapping[t.topic.toLowerCase()]) {
      normalizedName = tagMapping[t.topic.toLowerCase()];
    } else {
      normalizedName = t.topic.charAt(0).toUpperCase() + t.topic.slice(1);
    }

    if (!combinedTopicsMap[normalizedName]) {
      combinedTopicsMap[normalizedName] = {
        topic: normalizedName,
        count: 0,
        platform: t.platform
      };
    }
    
    combinedTopicsMap[normalizedName].count += t.count;
    if (combinedTopicsMap[normalizedName].platform !== t.platform) {
      combinedTopicsMap[normalizedName].platform = "mixed";
    }
  });

  const combinedTopics = Object.values(combinedTopicsMap);

  // Approximate total problems available per combined topic (LC + CF roughly)
  const COMBINED_TOPIC_TOTALS = {
    "Array": 1750,
    "String": 730 + 700, // 1430
    "Hash Table": 600,
    "Math": 550 + 2500, // 3050
    "Dynamic Programming": 520 + 2000, // 2520
    "Sorting": 400 + 1000, // 1400
    "Greedy": 360 + 2200, // 2560
    "Depth-First Search": 310 + 800, // 1110
    "Binary Search": 280 + 900, // 1180
    "Tree": 230 + 800, // 1030
    "Breadth-First Search": 230,
    "Matrix": 220,
    "Two Pointers": 200 + 400, // 600
    "Bit Manipulation": 190 + 400, // 590
    "Stack": 160,
    "Graph": 150 + 1000, // 1150
    "Implementation": 3000,
    "Data Structures": 1500,
    "Brute Force": 1300,
    "Constructive Algorithms": 1200,
    "Number Theory": 600,
    "Combinatorics": 500,
    "Geometry": 400,
    "Union-Find": 300,
    "Shortest Path": 200
  };

  // Group topics for progress bar display
  const topicDistribution = [...combinedTopics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map(t => {
      // Use predefined total if available, otherwise fallback to user's count * 1.5 (or min 50)
      const maxAvailable = COMBINED_TOPIC_TOTALS[t.topic] || Math.max(50, Math.ceil(t.count * 1.5));
      return {
        topic: t.topic,
        solved: t.count,
        max: maxAvailable,
        color: t.platform === "leetcode"
          ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
          : t.platform === "codeforces"
          ? "linear-gradient(90deg, #318dec 0%, #2563eb 100%)"
          : "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)" // Mixed color (purple to indigo)
      };
    });

  // Strengths & Weaknesses tags
  const sortedTopics = [...combinedTopics].sort((a, b) => b.count - a.count);
  const strengthTags = sortedTopics.slice(0, 10).map(t => t.topic);
  const weaknessTags = sortedTopics.slice(-10).reverse().map(t => t.topic);



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
              Competitive programmer
            </p>
          </div>
        </div>

        {/* Handles badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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



      {/* 4. Split Layout: Topic Distribution & Strengths/Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem" }} className="profile-charts-layout">
        
        {/* Topic Distribution Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Topic-wise Solved Distribution</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "0.25rem 0", maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }} className="custom-scrollbar">
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
                      width: animated ? `${Math.min(100, (t.solved / t.max) * 100)}%` : "0%",
                      background: t.color,
                      borderRadius: "4px",
                      transition: "width 0.8s ease-out"
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
            <div style={{ 
              padding: "0.85rem", 
              borderRadius: "10px", 
              background: "rgba(16, 185, 129, 0.03)", 
              border: "1px solid rgba(16, 185, 129, 0.1)",
              opacity: animated ? 1 : 0,
              transform: animated ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.5s ease-out"
            }}>
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
            <div style={{ 
              padding: "0.85rem", 
              borderRadius: "10px", 
              background: "rgba(239, 68, 68, 0.03)", 
              border: "1px solid rgba(239, 68, 68, 0.1)",
              opacity: animated ? 1 : 0,
              transform: animated ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.5s ease-out 0.1s"
            }}>
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

      <style jsx global>{`
        @media (max-width: 900px) {
          .profile-charts-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s infinite linear;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
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
