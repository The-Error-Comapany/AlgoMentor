"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Clock, Bell, Trash2, Calendar, PlusCircle, CheckCircle, Sparkles } from "lucide-react";

function RemindersContent() {
  const [reminders, setReminders] = useState([]);
  
  // Custom manual reminder form states
  const [form, setForm] = useState({
    name: "",
    platform: "LeetCode",
    start: "",
    timing: "60"
  });

  const [loading, setLoading] = useState(false);

  // Sync scheduled reminders from localStorage
  const loadReminders = () => {
    const saved = localStorage.getItem("contest_reminders");
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Load prefilled mock reminders for visual layout if none set
      const defaultReminders = [
        { id: "cf1", name: "Codeforces Round 998 (Div 2)", platform: "Codeforces", start: "2026-05-21T13:30:00Z", timing: "1 hour before", status: "Scheduled" },
        { id: "lc1", name: "LeetCode Weekly Contest 432", platform: "LeetCode", start: "2026-05-23T02:30:00Z", timing: "30 mins before", status: "Scheduled" },
        { id: "past1", name: "Codeforces Round 995 (Div 3)", platform: "Codeforces", start: "2026-05-18T14:35:00Z", timing: "1 hour before", status: "Sent" }
      ];
      setReminders(defaultReminders);
      localStorage.setItem("contest_reminders", JSON.stringify(defaultReminders));
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleDelete = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem("contest_reminders", JSON.stringify(updated));
  };

  const handleCreateReminder = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.start) return;

    setLoading(true);

    const timingMap = {
      "10": "10 mins before",
      "30": "30 mins before",
      "60": "1 hour before",
      "120": "2 hours before"
    };

    const newReminder = {
      id: "manual_" + Date.now(),
      name: form.name.trim(),
      platform: form.platform,
      start: new Date(form.start).toISOString(),
      timing: timingMap[form.timing] || "1 hour before",
      status: "Scheduled"
    };

    setTimeout(() => {
      const updated = [newReminder, ...reminders];
      setReminders(updated);
      localStorage.setItem("contest_reminders", JSON.stringify(updated));
      setForm({ name: "", platform: "LeetCode", start: "", timing: "60" });
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }} className="reminders-grid-layout">
      
      {/* 1. Reminders List Table */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Bell size={16} style={{ color: "var(--primary-light)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Active Scheduled Alerts</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total: {reminders.filter(r => r.status === "Scheduled").length} Scheduled</span>
        </div>

        {reminders.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <p>No contest reminders active. Use the Contest Calendar or the manual form to set alerts!</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Contest Name</th>
                  <th>Platform</th>
                  <th>Start Time</th>
                  <th>Alert Set</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((rem) => {
                  const formattedDate = new Date(rem.start).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  });

                  return (
                    <tr key={rem.id}>
                      <td style={{ fontWeight: "600", fontSize: "0.85rem" }}>{rem.name}</td>
                      <td>
                        <span className={`badge ${rem.platform === "LeetCode" ? "badge-leetcode" : rem.platform === "Codeforces" ? "badge-codeforces" : "badge-gfg"}`}>
                          {rem.platform}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{formattedDate}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{rem.timing}</td>
                      <td>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: rem.status === "Scheduled" ? "var(--text-info)" : rem.status === "Sent" ? "var(--text-success)" : "var(--text-danger)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <span style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor: rem.status === "Scheduled" ? "var(--info)" : rem.status === "Sent" ? "var(--success)" : "var(--danger)"
                          }} />
                          {rem.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn db-logout-btn"
                          style={{ padding: "0.4rem" }}
                          onClick={() => handleDelete(rem.id)}
                          title="Delete Scheduled Alert"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Manual Scheduler Form Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Manual Reminder Card Form */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={16} style={{ color: "var(--primary-light)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Set Custom Alert</h3>
          </div>

          <form onSubmit={handleCreateReminder} style={{ gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Contest Title</label>
              <input
                type="text"
                placeholder="e.g. Codeforces Div 3 Round"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  style={{ fontSize: "0.8rem", padding: "0.4rem" }}
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="GeeksforGeeks">GeeksforGeeks</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Alert Timing</label>
                <select
                  value={form.timing}
                  onChange={(e) => setForm({ ...form, timing: e.target.value })}
                  style={{ fontSize: "0.8rem", padding: "0.4rem" }}
                >
                  <option value="10">10 mins before</option>
                  <option value="30">30 mins before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Contest Start Time</label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", height: "40px", marginTop: "0.5rem" }}>
              <span>{loading ? "Scheduling..." : "Schedule Alert"}</span>
            </button>
          </form>
        </div>

        {/* Sync Indicator Card */}
        <div className="glass-card" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)", borderColor: "rgba(99, 102, 241, 0.2)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <Sparkles size={16} style={{ color: "var(--text-warning)", flexShrink: "0", marginTop: "2px" }} />
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", color: "white" }}>Real-time Browser Sync</span>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: "1.4" }}>
              Any reminder scheduled manually or via the Contest Calendar sets an active timer loop inside your browser session, sending a mock notification alert card whenever the deadline threshold is crossed.
            </p>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .reminders-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

function Reminders() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RemindersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Reminders;
