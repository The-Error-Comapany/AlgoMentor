"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarIcon, List, Clock, Bell, ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const INITIAL_CONTESTS = [
  { id: "cf1", name: "Codeforces Round 998 (Div 2)", platform: "Codeforces", start: "2026-05-21T13:30:00Z", duration: "120 mins", link: "https://codeforces.com/contests", dateDay: 21 },
  { id: "lc1", name: "LeetCode Weekly Contest 432", platform: "LeetCode", start: "2026-05-23T02:30:00Z", duration: "90 mins", link: "https://leetcode.com/contest/", dateDay: 23 },
  { id: "gfg1", name: "GeeksforGeeks Weekly Challenge", platform: "GeeksforGeeks", start: "2026-05-24T10:00:00Z", duration: "120 mins", link: "https://practice.geeksforgeeks.org/events/rec/weekly-challenges", dateDay: 24 },
  { id: "cf2", name: "Codeforces Educational Round 165", platform: "Codeforces", start: "2026-05-27T14:35:00Z", duration: "120 mins", link: "https://codeforces.com/contests", dateDay: 27 },
  { id: "lc2", name: "LeetCode Biweekly Contest 129", platform: "LeetCode", start: "2026-05-30T14:30:00Z", duration: "90 mins", link: "https://leetcode.com/contest/", dateDay: 30 },
  { id: "cf3", name: "Codeforces Round 999 (Div 1 + Div 2)", platform: "Codeforces", start: "2026-06-03T13:30:00Z", duration: "150 mins", link: "https://codeforces.com/contests", dateDay: 3 }
];

function ContestsContent() {
  const [view, setView] = useState("calendar"); // calendar | list
  const [platformFilter, setPlatformFilter] = useState("All"); // All | LeetCode | Codeforces | GeeksforGeeks
  const [reminders, setReminders] = useState([]);
  const [now, setNow] = useState(new Date());

  // Load reminders on mount
  useEffect(() => {
    const saved = localStorage.getItem("contest_reminders");
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error(e);
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
    localStorage.setItem("contest_reminders", JSON.stringify(updated));
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

  // Filtered contests list
  const filteredContests = INITIAL_CONTESTS.filter(c => {
    if (platformFilter === "All") return true;
    return c.platform === platformFilter;
  });

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Platform & View Selection Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        
        {/* Platform tabs */}
        <div style={{ display: "flex", gap: "6px", background: "var(--bg-darker)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-ice)" }}>
          {["All", "LeetCode", "Codeforces", "GeeksforGeeks"].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`btn btn-sm ${platformFilter === p ? "btn-primary" : ""}`}
              style={{
                background: platformFilter === p ? "var(--primary-gradient)" : "none",
                border: "none",
                fontSize: "0.8rem",
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                color: platformFilter === p ? "white" : "var(--text-secondary)"
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div style={{ display: "flex", gap: "6px", background: "var(--bg-darker)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-ice)" }}>
          <button
            onClick={() => setView("calendar")}
            className="btn btn-sm"
            style={{
              background: view === "calendar" ? "rgba(255,255,255,0.06)" : "none",
              border: "none",
              padding: "0.4rem 0.65rem",
              borderRadius: "8px",
              color: view === "calendar" ? "white" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <CalendarIcon size={14} />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setView("list")}
            className="btn btn-sm"
            style={{
              background: view === "list" ? "rgba(255,255,255,0.06)" : "none",
              border: "none",
              padding: "0.4rem 0.65rem",
              borderRadius: "8px",
              color: view === "list" ? "white" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <List size={14} />
            <span>Timeline</span>
          </button>
        </div>

      </div>

      {/* Main Views Container */}
      {view === "list" ? (
        
        /* Timeline View */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="contests-list-grid">
          {filteredContests.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: "span 2", textAlign: "center", padding: "4rem" }}>
              <p style={{ color: "var(--text-secondary)" }}>No contests found matching active platform filter.</p>
            </div>
          ) : (
            filteredContests.map((c) => {
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
                    borderLeft: `4px solid ${c.platform === "LeetCode" ? "#ffa116" : c.platform === "Codeforces" ? "#318dec" : "#2f8d46"}`,
                    background: "linear-gradient(to right, rgba(255,255,255,0.01), transparent)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className={`badge ${c.platform === "LeetCode" ? "badge-leetcode" : c.platform === "Codeforces" ? "badge-codeforces" : "badge-gfg"}`}>
                        {c.platform}
                      </span>
                      <h4 style={{ fontSize: "1rem", margin: "6px 0 2px" }}>{c.name}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={10} />
                        {formattedDate} (Local)
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
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
                    >
                      <Bell size={12} />
                      <span>{isRem ? "Alert Enabled" : "Notify Me"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        
        /* Grid Calendar View */
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Month Indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{monthName}</h3>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.35rem" }} disabled><ChevronLeft size={16} /></button>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.35rem" }} disabled><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.5rem" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <span key={day} style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>{day}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", minHeight: "360px" }}>
            {calendarDays.map((day, idx) => {
              const dayContests = getContestsForDay(day);
              const isToday = day === 21; // Mock current date is May 21st 2026

              return (
                <div
                  key={idx}
                  style={{
                    background: day ? "rgba(13, 18, 32, 0.4)" : "transparent",
                    border: day ? `1px solid ${isToday ? "rgba(99, 102, 241, 0.4)" : "var(--border-ice)"}` : "none",
                    borderRadius: "10px",
                    padding: "6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    position: "relative",
                    transition: "border-color 0.15s"
                  }}
                  className={day ? "calendar-cell-active" : ""}
                >
                  {day && (
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: isToday ? "700" : "500",
                      color: isToday ? "var(--primary-light)" : "var(--text-secondary)",
                      background: isToday ? "rgba(99, 102, 241, 0.1)" : "none",
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

                  {/* Contest Markers inside calendar cells */}
                  {dayContests.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => toggleReminder(c)}
                      title={`${c.name}\nClick to Toggle Alert!`}
                      style={{
                        background: c.platform === "LeetCode" ? "rgba(245, 158, 11, 0.1)" : c.platform === "Codeforces" ? "rgba(49, 141, 236, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        border: `1px solid ${c.platform === "LeetCode" ? "rgba(245, 158, 11, 0.2)" : c.platform === "Codeforces" ? "rgba(49, 141, 236, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
                        borderRadius: "4px",
                        padding: "2px 4px",
                        fontSize: "0.6rem",
                        color: c.platform === "LeetCode" ? "#ffa116" : c.platform === "Codeforces" ? "#318dec" : "#2f8d46",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
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
                      <span>{c.platform === "LeetCode" ? "LC" : c.platform === "Codeforces" ? "CF" : "GFG"}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Reminder Help Box */}
      <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(139, 92, 246, 0.03)", borderColor: "rgba(139, 92, 246, 0.15)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
          <Sparkles size={18} />
        </div>
        <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          Setting reminders adds contest entries to your local database browser alerts. In **Calendar View**, click any contest chip directly to toggle scheduled reminders. Your alerts will auto-sync with the [Contest Reminders](file:///problems) screen.
        </p>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .contests-list-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .calendar-cell-active:hover {
          border-color: var(--border-ice-hover) !important;
          background: rgba(13, 18, 32, 0.6) !important;
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
