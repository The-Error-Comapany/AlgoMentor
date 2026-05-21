"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarIcon, Clock, Bell, ExternalLink, Sparkles, X } from "lucide-react";

const INITIAL_CONTESTS = [
  { id: "cf1", name: "Codeforces Round 998 (Div 2)", platform: "Codeforces", start: "2026-05-21T13:30:00Z", duration: "120 mins", link: "https://codeforces.com/contests", dateDay: 21 },
  { id: "lc1", name: "LeetCode Weekly Contest 432", platform: "LeetCode", start: "2026-05-23T02:30:00Z", duration: "90 mins", link: "https://leetcode.com/contest/", dateDay: 23 },
  { id: "cf2", name: "Codeforces Educational Round 165", platform: "Codeforces", start: "2026-05-27T14:35:00Z", duration: "120 mins", link: "https://codeforces.com/contests", dateDay: 27 },
  { id: "lc2", name: "LeetCode Biweekly Contest 129", platform: "LeetCode", start: "2026-05-30T14:30:00Z", duration: "90 mins", link: "https://leetcode.com/contest/", dateDay: 30 },
  { id: "cf3", name: "Codeforces Round 999 (Div 1 + Div 2)", platform: "Codeforces", start: "2026-06-03T13:30:00Z", duration: "150 mins", link: "https://codeforces.com/contests", dateDay: 3 }
];

function ContestsContent() {
  const [reminders, setReminders] = useState([]);
  const [now, setNow] = useState(new Date());
  const [activeModalContests, setActiveModalContests] = useState(null); // Contests to show in detail modal

  // Load reminders on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("contest_reminders");
      if (saved) {
        try {
          setReminders(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Update current time clock for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleReminder = (contest) => {
    let updated;
    const isSet = reminders.some(r => r.id === contest.id);
    if (isSet) {
      updated = reminders.filter(r => r.id !== contest.id);
    } else {
      updated = [...reminders, {
        id: contest.id,
        name: contest.name,
        platform: contest.platform,
        start: contest.start,
        timing: "1 hour before",
        status: "Scheduled"
      }];
    }
    setReminders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("contest_reminders", JSON.stringify(updated));
    }
  };

  const getCountdown = (startTimeStr) => {
    const diff = new Date(startTimeStr).getTime() - now.getTime();
    if (diff <= 0) return "Started";
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Calendar parameters (May 2026)
  const monthName = "May 2026";
  const daysInMonth = 31;
  const startDayOfWeek = 5; // May 1st 2026 is a Friday (index 5)
  const calendarDays = [];

  // Empty slots for preceding month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days of May
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Group contests by day in May for calendar cells
  const getContestsForDay = (day) => {
    if (!day) return [];
    return INITIAL_CONTESTS.filter(c => {
      const cDate = new Date(c.start);
      return cDate.getMonth() === 4 && cDate.getDate() === day; // May (month index 4)
    });
  };

  const handleDayClick = (day) => {
    const dayContests = getContestsForDay(day);
    if (dayContests.length > 0) {
      setActiveModalContests({ day, contests: dayContests });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: "600", marginBottom: "0.25rem" }}>Contest Schedule</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0" }}>
          Track and register for upcoming competitive programming contests on LeetCode and Codeforces
        </p>
      </div>

      {/* 1. TOP: Timeline List of Upcoming Contests */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 0.5rem" }}>
          <Clock size={18} style={{ color: "var(--primary-light)" }} />
          Upcoming Contests Timeline
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="contests-list-grid">
          {INITIAL_CONTESTS.map((c) => {
            const isRem = reminders.some(r => r.id === c.id);
            const formattedDate = new Date(c.start).toLocaleDateString("en-US", {
              weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            });

            return (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  borderLeft: `4px solid ${c.platform === "LeetCode" ? "#ffa116" : "#318dec"}`,
                  background: "linear-gradient(to right, rgba(255,255,255,0.01), transparent)",
                  padding: "1.25rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className={`badge ${c.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`}>
                      {c.platform}
                    </span>
                    <h4 style={{ fontSize: "1rem", margin: "8px 0 4px", fontWeight: "600" }}>{c.name}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", margin: "0" }}>
                      <Clock size={12} />
                      {formattedDate} (Local)
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                      Duration: {c.duration}
                    </p>
                  </div>

                  <a href={c.link} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: "0.35rem 0.5rem" }}>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid var(--border-ice)", paddingTop: "0.75rem" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Starting In</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "var(--font-mono)", color: "var(--text-warning)" }}>
                      {getCountdown(c.start)}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleReminder(c)}
                    className={`btn btn-sm ${isRem ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Bell size={12} />
                    <span>{isRem ? "Alert Enabled" : "Set Reminder"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BOTTOM: Highlighted Monthly Calendar */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: "0" }}>
            <CalendarIcon size={18} style={{ color: "var(--primary-light)" }} />
            Monthly Schedule ({monthName})
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Click highlighted days for quick registration details
          </span>
        </div>

        {/* Days of Week Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.5rem" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <span key={day} style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>{day}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", minHeight: "340px" }}>
          {calendarDays.map((day, idx) => {
            const dayContests = getContestsForDay(day);
            const isToday = day === 21; // Mock current date is May 21st 2026
            const hasContest = dayContests.length > 0;

            return (
              <div
                key={idx}
                onClick={() => day && handleDayClick(day)}
                style={{
                  background: day ? (hasContest ? "rgba(99, 102, 241, 0.04)" : "rgba(13, 18, 32, 0.4)") : "transparent",
                  border: day ? `1px solid ${isToday ? "var(--primary-light)" : (hasContest ? "rgba(99, 102, 241, 0.25)" : "var(--border-ice)")}` : "none",
                  borderRadius: "10px",
                  padding: "6px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  position: "relative",
                  cursor: day && hasContest ? "pointer" : "default",
                  transition: "all 0.15s"
                }}
                className={day && hasContest ? "calendar-cell-active" : ""}
              >
                {day && (
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: isToday || hasContest ? "700" : "500",
                    color: isToday ? "white" : (hasContest ? "var(--primary-light)" : "var(--text-secondary)"),
                    background: isToday ? "var(--primary-gradient)" : "none",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "2px"
                  }}>
                    {day}
                  </span>
                )}

                {/* Contest Markers */}
                {dayContests.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: c.platform === "LeetCode" ? "rgba(245, 158, 11, 0.1)" : "rgba(49, 141, 236, 0.1)",
                      border: `1px solid ${c.platform === "LeetCode" ? "rgba(245, 158, 11, 0.2)" : "rgba(49, 141, 236, 0.2)"}`,
                      borderRadius: "4px",
                      padding: "2px 4px",
                      fontSize: "0.6rem",
                      color: c.platform === "LeetCode" ? "#ffa116" : "#318dec",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px"
                    }}
                  >
                    <span style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: reminders.some(r => r.id === c.id) ? "var(--success)" : "transparent",
                      border: `1px solid ${reminders.some(r => r.id === c.id) ? "transparent" : "currentColor"}`
                    }} />
                    <span>{c.platform === "LeetCode" ? "LC" : "CF"}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Day Contest Modal */}
      {activeModalContests && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div className="glass-card" style={{
            maxWidth: "500px",
            width: "100%",
            padding: "1.5rem",
            position: "relative",
            background: "var(--bg-darker)",
            borderColor: "rgba(255,255,255,0.15)",
            animation: "fadeIn 0.2s ease-in-out"
          }}>
            <button 
              onClick={() => setActiveModalContests(null)}
              style={{
                position: "absolute",
                right: "1rem",
                top: "1rem",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarIcon size={18} style={{ color: "var(--primary-light)" }} />
              Contests on May {activeModalContests.day}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeModalContests.contests.map((c) => {
                const isRem = reminders.some(r => r.id === c.id);
                const formattedDate = new Date(c.start).toLocaleDateString("en-US", {
                  hour: "2-digit", minute: "2-digit", timeZoneName: "short"
                });

                return (
                  <div key={c.id} style={{
                    padding: "1rem",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-ice)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className={`badge ${c.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`}>
                        {c.platform}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-warning)" }}>
                        {getCountdown(c.start)}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: "0.95rem", margin: "0 0 4px", fontWeight: "600" }}>{c.name}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0" }}>
                        Time: {formattedDate} | Duration: {c.duration}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "0.25rem" }}>
                      <a 
                        href={c.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-primary btn-sm"
                        style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "0.75rem", padding: "0.4rem" }}
                      >
                        <span>Register Now</span>
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => toggleReminder(c)}
                        className={`btn btn-sm ${isRem ? "btn-secondary" : "btn-secondary"}`}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.4rem 0.75rem",
                          background: isRem ? "rgba(99, 102, 241, 0.15)" : "none",
                          border: isRem ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--border-ice)",
                          color: isRem ? "var(--primary-light)" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Bell size={12} />
                        <span>{isRem ? "Alert Active" : "Set Alert"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Reminder Help Box */}
      <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(139, 92, 246, 0.03)", borderColor: "rgba(139, 92, 246, 0.15)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
          <Sparkles size={18} />
        </div>
        <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          All times are shown in your local timezone. Reminders will be stored in your active browser session so you never miss another round. Clicking highlighted dates in the calendar presents direct contest information.
        </p>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .contests-list-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .calendar-cell-active:hover {
          border-color: rgba(99, 102, 241, 0.5) !important;
          background: rgba(99, 102, 241, 0.08) !important;
          transform: translateY(-1px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
}

function Contests() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContestsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Contests;
