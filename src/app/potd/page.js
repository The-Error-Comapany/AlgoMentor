"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Flame, CheckCircle, ExternalLink, Calendar, HelpCircle, Award, Sparkles } from "lucide-react";

const INITIAL_TODAY_POTD = [
  { id: "lc_today", title: "Sliding Window Maximum", platform: "LeetCode", difficulty: "Hard", link: "https://leetcode.com/problems/sliding-window-maximum/", tags: ["sliding window", "deque", "monotonic queue"], date: "May 21, 2026" },
  { id: "gfg_today", title: "Minimum Operations to Halve Array Sum", platform: "GeeksforGeeks", difficulty: "Medium", link: "https://www.geeksforgeeks.org/problems/minimum-operations-to-halve-array-sum/1", tags: ["greedy", "priority queue", "heap"], date: "May 21, 2026" }
];

const INITIAL_HISTORY = [
  { date: "May 20, 2026", title: "Edit Distance", platform: "LeetCode", difficulty: "Hard", status: "Solved" },
  { date: "May 20, 2026", title: "Find Transition Point", platform: "GeeksforGeeks", difficulty: "Easy", status: "Solved" },
  { date: "May 19, 2026", title: "Unique Paths II", platform: "LeetCode", difficulty: "Medium", status: "Missed" },
  { date: "May 19, 2026", title: "Detect Loop in Linked List", platform: "GeeksforGeeks", difficulty: "Medium", status: "Solved" },
  { date: "May 18, 2026", title: "Course Schedule II", platform: "LeetCode", difficulty: "Medium", status: "Attempted" },
  { date: "May 17, 2026", title: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", status: "Missed" },
  { date: "May 16, 2026", title: "Merge K Sorted Lists", platform: "LeetCode", difficulty: "Hard", status: "Solved" }
];

function PotdContent() {
  const [solvedState, setSolvedState] = useState({
    lc_today: false,
    gfg_today: false
  });
  
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [points, setPoints] = useState(380);

  // Synchronize dynamic solved status into past days history lists
  const handleSolve = (id, problem) => {
    setSolvedState(prev => {
      const isNowSolved = !prev[id];
      
      // Update history list reactively
      if (isNowSolved) {
        setPoints(p => p + 25); // award XP points
        const newHistItem = {
          date: "May 21, 2026",
          title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          status: "Solved"
        };
        setHistory(prevHist => [newHistItem, ...prevHist]);
      } else {
        setPoints(p => Math.max(0, p - 25));
        setHistory(prevHist => prevHist.filter(h => h.title !== problem.title));
      }

      return { ...prev, [id]: isNowSolved };
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Dynamic POTD points overview banner */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--text-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={22} className="pulse-green" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", margin: "0", textAlign: "left" }}>Daily Problem of the Day</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0" }}>Solve daily challenges on LeetCode & GFG to earn streak multipliers.</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Total POTD XP</span>
            <h4 style={{ fontSize: "1.3rem", color: "var(--text-success)", margin: "0" }}>{points} XP</h4>
          </div>
          <div style={{ height: "30px", width: "1px", background: "var(--border-ice)" }} />
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Active Solved</span>
            <h4 style={{ fontSize: "1.3rem", color: "white", margin: "0" }}>{Object.values(solvedState).filter(Boolean).length}/2 Done</h4>
          </div>
        </div>
      </div>

      {/* Today's Problems Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="potd-today-grid">
        
        {INITIAL_TODAY_POTD.map((prob) => {
          const isDone = solvedState[prob.id];

          return (
            <div
              key={prob.id}
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                position: "relative",
                borderColor: isDone ? "rgba(16, 185, 129, 0.3)" : "var(--border-ice)",
                background: isDone ? "linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(13, 18, 32, 0.6) 100%)" : "rgba(13, 18, 32, 0.55)",
                transition: "all var(--transition-normal)"
              }}
            >
              {/* Header inside POTD Card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "6px" }}>
                    <span className={`badge ${prob.platform === "LeetCode" ? "badge-leetcode" : "badge-gfg"}`}>
                      {prob.platform}
                    </span>
                    <span className={`badge ${prob.difficulty === "Hard" ? "badge-hard" : "badge-medium"}`}>
                      {prob.difficulty}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "left" }}>{prob.title}</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <Calendar size={12} />
                    Challenge Date: {prob.date}
                  </span>
                </div>

                <a href={prob.link} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: "36px", height: "36px", padding: "0" }}>
                  <ExternalLink size={16} />
                </a>
              </div>

              {/* Tags inside POTD Card */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {prob.tags.map(t => (
                  <span key={t} style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "4px", color: "var(--text-secondary)", border: "1px solid var(--border-ice)" }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Footer inside POTD Card: Claim Button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "auto" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={12} style={{ color: "var(--text-warning)" }} />
                  +25 XP Reward Point
                </span>

                <button
                  onClick={() => handleSolve(prob.id, prob)}
                  className={`btn ${isDone ? "btn-secondary" : "btn-primary"}`}
                  style={{
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.8rem",
                    backgroundColor: isDone ? "rgba(16, 185, 129, 0.15)" : "",
                    borderColor: isDone ? "rgba(16, 185, 129, 0.3)" : "",
                    color: isDone ? "var(--text-success)" : "white"
                  }}
                >
                  {isDone ? <CheckCircle size={14} /> : null}
                  <span>{isDone ? "Completed" : "Mark as Solved"}</span>
                </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* History log header */}
      <div style={{ marginTop: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={16} style={{ color: "var(--text-muted)" }} />
          Past 7 Days History
        </h3>
        
        {/* History table */}
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Problem Name</th>
                  <th>Platform</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((hist, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{hist.date}</td>
                    <td style={{ fontWeight: "600", fontSize: "0.85rem" }}>{hist.title}</td>
                    <td>
                      <span className={`badge ${hist.platform === "LeetCode" ? "badge-leetcode" : "badge-gfg"}`} style={{ fontSize: "0.6rem" }}>
                        {hist.platform}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${hist.difficulty === "Hard" ? "badge-hard" : hist.difficulty === "Easy" ? "badge-easy" : "badge-medium"}`} style={{ fontSize: "0.6rem" }}>
                        {hist.difficulty}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: hist.status === "Solved" ? "var(--text-success)" : hist.status === "Attempted" ? "var(--text-warning)" : "var(--text-danger)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: hist.status === "Solved" ? "var(--success)" : hist.status === "Attempted" ? "var(--warning)" : "var(--danger)"
                        }} />
                        {hist.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .potd-today-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

function Potd() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PotdContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Potd;
