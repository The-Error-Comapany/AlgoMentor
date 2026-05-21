"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bell,
  Clock,
  Sparkles,
  TrendingUp,
  Brain,
  Code2,
  Calendar
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const [userName, setUserName] = useState("Aishvary");

  // Load registered name if any from settings/profile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  // Mock contest reminder states for LC & CF
  const [reminders, setReminders] = useState({
    cf: false,
    lc: false
  });

  // Contest countdowns (in seconds, simulated)
  const [countdowns, setCountdowns] = useState({
    cf: 7200 + 45 * 60, // 2h 45m
    lc: 86400 * 2 + 14400 // 2 days 4 hours
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) => ({
        cf: prev.cf > 0 ? prev.cf - 1 : 7200,
        lc: prev.lc > 0 ? prev.lc - 1 : 86400
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleReminder = (platform) => {
    setReminders((prev) => {
      const newVal = !prev[platform];
      return { ...prev, [platform]: newVal };
    });
  };

  // Purely LeetCode POTD
  const leetCodePotd = {
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/sliding-window-maximum/",
    tags: ["Queue", "Sliding Window"]
  };

  // Exactly 5 recent submissions across LC and CF only
  const recentSubmissions = [
    { title: "Edit Distance", platform: "LeetCode", verdict: "Accepted", lang: "C++", time: "10 mins ago", difficulty: "Hard" },
    { title: "Divisibility by 2^n", platform: "Codeforces", verdict: "Time Limit Exceeded", lang: "C++", time: "45 mins ago", difficulty: "Medium" },
    { title: "Binary Tree Maximum Path Sum", platform: "LeetCode", verdict: "Accepted", lang: "Java", time: "3 hours ago", difficulty: "Hard" },
    { title: "Valid Parentheses", platform: "LeetCode", verdict: "Accepted", lang: "Python", time: "Yesterday", difficulty: "Easy" },
    { title: "XOR-Construction", platform: "Codeforces", verdict: "Wrong Answer", lang: "C++", time: "2 days ago", difficulty: "Medium" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Greeting + Summary Bar */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.25rem", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)", borderColor: "rgba(99, 102, 241, 0.2)" }}>
        <div style={{ flexGrow: "1" }}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.25rem", textAlign: "left" }}>
            Welcome back, {userName}! 👋
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0" }}>
            You've solved <span style={{ color: "white", fontWeight: "600" }}>342 problems</span>. Keep pushing to reach your target skill rating! 🚀
          </p>
        </div>
        
        {/* Weekly Goal Progress */}
        <div style={{ width: "220px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Weekly Goal Progress</span>
            <span style={{ color: "white", fontWeight: "600" }}>85% (17/20)</span>
          </div>
          <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
            <div style={{ height: "100%", width: "85%", background: "var(--primary-gradient)", borderRadius: "4px", boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)" }} />
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid-4">
        
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--text-success)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Solved</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0" }}>
              843 <span style={{ fontSize: "0.7rem", color: "var(--text-success)", fontWeight: "500" }}>+12% wk</span>
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#ffa116", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>LeetCode Rating</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0", color: "#ffa116" }}>
              1942 <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "400" }}>Top 4%</span>
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(14, 165, 233, 0.1)", color: "#318dec", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Codeforces Rating</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0", color: "#318dec" }}>
              1684 <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "500" }}>Expert</span>
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--text-danger)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={20} className="pulse-green" style={{ color: "var(--danger)" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Current Streak</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0", color: "var(--text-danger)" }}>
              18 Days <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "400" }}>Max 42</span>
            </h3>
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }} className="grid-responsive-two">
        
        {/* Left Column: POTD & Recent Submissions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* LeetCode POTD Card */}
          <div className="glass-card" style={{ 
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)",
            borderColor: "rgba(245, 158, 11, 0.2)",
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Flame size={18} style={{ color: "#ffa116" }} />
                <h3 style={{ fontSize: "1.1rem" }}>LeetCode Problem of the Day</h3>
              </div>
              <span className="badge badge-leetcode" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>LeetCode Only</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", background: "rgba(8, 11, 17, 0.4)", borderRadius: "12px", border: "1px solid var(--border-ice)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "6px" }}>
                  <span className="badge badge-hard" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                    {leetCodePotd.difficulty}
                  </span>
                  {leetCodePotd.tags.map(t => (
                    <span key={t} style={{ fontSize: "0.7rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.03)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <h4 style={{ fontSize: "1.1rem", margin: "0", color: "white", fontWeight: "600" }}>{leetCodePotd.title}</h4>
              </div>
              <a href={leetCodePotd.link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Solve Now</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Recent Submissions Feed */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Code2 size={16} style={{ color: "var(--primary-light)" }} />
                <h3 style={{ fontSize: "1.1rem" }}>Recent Submissions Feed</h3>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }} onClick={() => router.push("/profile")} className="link">Full History</span>
            </div>

            <div className="table-container" style={{ border: "none", background: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Lang</th>
                    <th>Verdict</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{sub.title}</span>
                          <span className={`badge ${sub.difficulty === "Hard" ? "badge-hard" : "badge-medium"}`} style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem", alignSelf: "flex-start", marginTop: "2px" }}>
                            {sub.difficulty}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${sub.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.65rem" }}>
                          {sub.platform}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{sub.lang}</td>
                      <td>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: sub.verdict === "Accepted" ? "var(--text-success)" : sub.verdict === "Wrong Answer" ? "var(--text-danger)" : "var(--text-warning)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          {sub.verdict === "Accepted" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
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

        </div>

        {/* Right Column: Upcoming Contests & AI Recommendation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Upcoming Contests Widget */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={16} style={{ color: "var(--primary-light)" }} />
                <h3 style={{ fontSize: "1.1rem" }}>Upcoming Contests</h3>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }} onClick={() => router.push("/contests")} className="link">Calendar View</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Contest 1: Codeforces */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(49, 141, 236, 0.04)", border: "1px solid rgba(49, 141, 236, 0.1)" }}>
                <div>
                  <span className="badge badge-codeforces" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", marginBottom: "4px" }}>Codeforces</span>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>CF Round 998 (Div 2)</div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Duration: 2h 00m</span>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-warning)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={10} />
                    {formatCountdown(countdowns.cf)}
                  </span>
                  <button
                    className={`btn btn-sm ${reminders.cf ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem" }}
                    onClick={() => toggleReminder("cf")}
                  >
                    <Bell size={10} />
                    <span>{reminders.cf ? "Reminder Set" : "Set Alert"}</span>
                  </button>
                </div>
              </div>

              {/* Contest 2: LeetCode */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                <div>
                  <span className="badge badge-leetcode" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", marginBottom: "4px" }}>LeetCode</span>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Weekly Contest 432</div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Duration: 1h 30m</span>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={10} />
                    {formatCountdown(countdowns.lc)}
                  </span>
                  <button
                    className={`btn btn-sm ${reminders.lc ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem" }}
                    onClick={() => toggleReminder("lc")}
                  >
                    <Bell size={10} />
                    <span>{reminders.lc ? "Reminder Set" : "Set Alert"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommended next topic card */}
          <div className="glass-card" style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)",
            borderColor: "rgba(99, 102, 241, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Brain size={18} style={{ color: "var(--text-warning)" }} />
              <h3 style={{ fontSize: "1.1rem", color: "white" }}>AI Recommendation</h3>
            </div>
            
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0", lineHeight: "1.4" }}>
              Based on your recent TLE rates on Recursion problems and low rating on Dynamic Programming tags, we recommend practicing <span style={{ color: "white", fontWeight: "600" }}>Sliding Window problems</span>. It will build key state memoization fundamentals.
            </p>

            <button
              className="btn btn-primary btn-sm"
              style={{ alignSelf: "flex-start", marginTop: "0.5rem", padding: "0.45rem 1rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
              onClick={() => router.push("/mentor")}
            >
              <Sparkles size={12} />
              <span>Discuss with AI Mentor</span>
            </button>
          </div>

        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .grid-responsive-two {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Dashboard;
