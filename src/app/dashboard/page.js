"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
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
  const { user, loading: loadingUser } = useAuth();
  
  // Sync data states
  const [stats, setStats] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [potd, setPotd] = useState(null);
  const [contests, setContests] = useState([]);
  
  // Timers and interactive states
  const [timeNow, setTimeNow] = useState(null);
  const [reminders, setReminders] = useState({ cf: false, lc: false });

  // Initialize timeNow on client
  useEffect(() => {
    setTimeNow(new Date());
    const timer = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        const subsRes = await fetch(`/api/user/submissions?userId=${user._id}&limit=50`);
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

  // 3. Fetch POTD and contests
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const potdRes = await fetch("/api/potd");
        const potdData = await potdRes.json();
        if (potdData && potdData.title) {
          setPotd(potdData);
        }

        const contestsRes = await fetch("/api/contests");
        const contestsData = await contestsRes.json();
        if (Array.isArray(contestsData)) {
          setContests(contestsData);
        }
      } catch (err) {
        console.error("Error fetching global data:", err);
      }
    };

    fetchGlobalData();
  }, []);

  // Helper: Format countdown from startTime
  const formatCountdown = (startTimeStr) => {
    if (!startTimeStr || !timeNow) return "00:00:00";
    const diffSeconds = Math.max(0, Math.floor((new Date(startTimeStr) - timeNow) / 1000));
    
    const d = Math.floor(diffSeconds / 86400);
    const h = Math.floor((diffSeconds % 86400) / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;
    
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

  // Toggle local reminders
  const toggleReminder = (platform) => {
    setReminders((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Filter data based on whether handles are currently connected/linked
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

  // Aggregated Stats Calculations
  const lcStats = user?.lcHandle ? activeStats.find((s) => s.platform === "leetcode") : null;
  const cfStats = user?.cfHandle ? activeStats.find((s) => s.platform === "codeforces") : null;

  const cfSolved = cfStats?.solved || (user?.cfHandle ? activeTopics.filter(t => t.platform === "codeforces").reduce((sum, t) => sum + t.count, 0) : 0);
  const totalSolved = (lcStats?.solved || 0) + cfSolved;
  const lcRating = lcStats?.rating || null;
  const cfRating = cfStats?.rating || null;
  const cfRank = cfStats?.rank || "N/A";

  // Calculate weekly goal progress (accepted submissions in the last 7 days vs target of 10)
  const last7DaysAccepted = activeSubmissions.filter((s) => {
    if (s.verdict.toLowerCase() !== "accepted" && s.verdict.toLowerCase() !== "ok") return false;
    const subDate = new Date(s.timestamp);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return subDate >= oneWeekAgo;
  }).length;
  const weeklyGoalTarget = 10;
  const weeklyGoalPercent = Math.min(100, Math.round((last7DaysAccepted / weeklyGoalTarget) * 100));

  // Calculate streak from submissions
  const calculateStreak = (subs) => {
    if (!subs || subs.length === 0) return 0;
    
    // Extract unique dates of accepted submissions in local timezone
    const solvedDates = new Set(
      subs
        .filter(s => s.verdict.toLowerCase() === "accepted" || s.verdict.toLowerCase() === "ok")
        .map(s => new Date(s.timestamp).toDateString())
    );

    let streak = 0;
    let checkDate = new Date();
    
    const todayStr = checkDate.toDateString();
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toDateString();
    
    if (!solvedDates.has(todayStr) && !solvedDates.has(yesterdayStr)) {
      return 0;
    }
    
    checkDate = new Date(); // Reset to today
    while (true) {
      const dateStr = checkDate.toDateString();
      if (solvedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak(activeSubmissions);

  // Find next upcoming contests
  const upcomingLC = contests
    .filter((c) => c.platform === "leetcode" && new Date(c.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

  const upcomingCF = contests
    .filter((c) => c.platform === "codeforces" && new Date(c.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

  // Topic diagnostics for AI Recommendation
  const [recommendation, setRecommendation] = useState("Link your competitive coding handles in Settings to analyze your performance and receive personalized AI recommendations.");
  
  useEffect(() => {
    const activeTopics = topics.filter(t => {
      if (t.platform === "leetcode" && !user?.lcHandle) return false;
      if (t.platform === "codeforces" && !user?.cfHandle) return false;
      return true;
    });

    if (activeTopics.length > 0) {
      const sortedTopics = [...activeTopics].sort((a, b) => a.count - b.count);
      const weakTopic = sortedTopics[0]?.topic || "Algorithms";
      setRecommendation(`Based on your synced solve history, we recommend focusing on ${weakTopic} problems. Improving your mastery in this category will help boost your performance.`);
    } else if (user?.lcHandle || user?.cfHandle) {
      setRecommendation("Generating diagnostic recommendations... Run sync in Settings to fetch your topic distributions.");
    } else {
      setRecommendation("Link your competitive coding handles in Settings to analyze your performance and receive personalized AI recommendations.");
    }
  }, [topics, user]);

  if (loadingUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "50%", border: "4px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", animation: "spin 1s infinite linear" }} />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Greeting + Summary Bar */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.25rem", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)", borderColor: "rgba(99, 102, 241, 0.2)" }}>
        <div style={{ flexGrow: "1" }}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.25rem", textAlign: "left" }}>
            Welcome back, {user?.name || "Developer"}! 👋
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0" }}>
            {user?.lcHandle || user?.cfHandle ? (
              <>
                You've solved <span style={{ color: "white", fontWeight: "600" }}>{totalSolved} problems</span> across connected platforms. Keep it up! 🚀
              </>
            ) : (
              <>
                Get started by linking your <span style={{ color: "var(--primary-light)" }}>LeetCode</span> and <span style={{ color: "var(--text-info)" }}>Codeforces</span> handles in <span style={{ color: "white", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/settings")}>Settings</span>.
              </>
            )}
          </p>
        </div>
        
        {/* Weekly Goal Progress */}
        <div style={{ width: "220px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Weekly Goal Progress</span>
            <span style={{ color: "white", fontWeight: "600" }}>{weeklyGoalPercent}% ({last7DaysAccepted}/{weeklyGoalTarget})</span>
          </div>
          <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
            <div style={{ height: "100%", width: `${weeklyGoalPercent}%`, background: "var(--primary-gradient)", borderRadius: "4px", boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)" }} />
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid-4">
        
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--text-success)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Solved</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0", fontWeight: "700" }}>
              {totalSolved}
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "4px", fontSize: "0.68rem" }}>
              <span style={{ color: "#ffa116" }}>
                LC: <strong style={{ color: "white" }}>{lcStats?.solved || 0}</strong>
              </span>
              <span style={{ color: "var(--text-muted)" }}>|</span>
              <span style={{ color: "#318dec" }}>
                CF: <strong style={{ color: "white" }}>{cfSolved}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#ffa116", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>LeetCode Rating</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0", color: "#ffa116" }}>
              {lcRating || "Unlinked"}
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
              {cfRating || "Unlinked"} <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "500" }}>{cfRating ? cfRank : ""}</span>
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--text-danger)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={20} style={{ color: "var(--danger)" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Current Streak</span>
            <h3 style={{ fontSize: "1.4rem", margin: "0", color: "var(--text-danger)" }}>
              {currentStreak} Day{currentStreak === 1 ? "" : "s"}
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
                <h3 style={{ fontSize: "1.1rem" }}>Problem of the Day</h3>
              </div>
              <span className="badge badge-leetcode" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>LeetCode</span>
            </div>

            {potd ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", background: "rgba(8, 11, 17, 0.4)", borderRadius: "12px", border: "1px solid var(--border-ice)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "6px" }}>
                    <span className={`badge badge-${potd.difficulty.toLowerCase()}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                      {potd.difficulty}
                    </span>
                    {(potd.tags || []).slice(0, 3).map(t => (
                      <span key={t} style={{ fontSize: "0.7rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.03)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <h4 style={{ fontSize: "1.1rem", margin: "0", color: "white", fontWeight: "600" }}>{potd.title}</h4>
                </div>
                <a href={potd.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Solve Now</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div style={{ padding: "1.2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No active challenge fetched. Global sync handles are loading.
              </div>
            )}
          </div>

          {/* Recent Submissions Feed */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Code2 size={16} style={{ color: "var(--primary-light)" }} />
                <h3 style={{ fontSize: "1.1rem" }}>Recent Submissions Feed</h3>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => router.push("/profile")} className="link">Full History</span>
            </div>

            <div className="table-container" style={{ border: "none", background: "none" }}>
              {activeSubmissions.length > 0 ? (
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
                    {activeSubmissions.slice(0, 5).map((sub, i) => (
                      <tr key={i}>
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
                            fontWeight: "600",
                            color: (sub.verdict === "Accepted" || sub.verdict === "OK") ? "var(--text-success)" : sub.verdict === "Wrong Answer" ? "var(--text-danger)" : "var(--text-warning)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            {(sub.verdict === "Accepted" || sub.verdict === "OK") ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
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
                  No submissions synced yet. Sync handles in settings to display coding activity.
                </div>
              )}
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
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => router.push("/contests")} className="link">Calendar View</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              
              {/* Codeforces Upcoming */}
              {upcomingCF ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(49, 141, 236, 0.04)", border: "1px solid rgba(49, 141, 236, 0.1)" }}>
                  <div>
                    <span className="badge badge-codeforces" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", marginBottom: "4px" }}>Codeforces</span>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upcomingCF.name}</div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Duration: {Math.round(upcomingCF.duration / 3600)}h</span>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-warning)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={10} />
                      {formatCountdown(upcomingCF.startTime)}
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
              ) : (
                <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
                  No upcoming Codeforces contests
                </div>
              )}

              {/* LeetCode Upcoming */}
              {upcomingLC ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                  <div>
                    <span className="badge badge-leetcode" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", marginBottom: "4px" }}>LeetCode</span>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upcomingLC.name}</div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Duration: {Math.round(upcomingLC.duration / 3600)}h</span>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={10} />
                      {formatCountdown(upcomingLC.startTime)}
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
              ) : (
                <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
                  No upcoming LeetCode contests
                </div>
              )}
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
              {recommendation}
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
        @keyframes spin {
          to { transform: rotate(360deg); }
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
