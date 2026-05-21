"use client";

import { useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { History, Search, Code2, Cpu, ExternalLink, Sparkles, Filter, RefreshCw } from "lucide-react";

const INITIAL_ANALYSES = [
  { id: 1, problem: "Sliding Window Maximum", platform: "LeetCode", lang: "C++ 20", tc: "O(N)", sc: "O(N) queue", verdict: "Optimal", date: "May 21, 2026", optimized: true },
  { id: 2, problem: "Two Sum", platform: "LeetCode", lang: "Python 3.10", tc: "O(N)", sc: "O(N) hashmap", verdict: "Optimal", date: "May 20, 2026", optimized: true },
  { id: 3, problem: "Edit Distance", platform: "LeetCode", lang: "C++ 20", tc: "O(N * M)", sc: "O(N * M) DP grid", verdict: "Optimal", date: "May 19, 2026", optimized: true },
  { id: 4, problem: "Fibonacci Numbers", platform: "GeeksforGeeks", lang: "C++ 20", tc: "O(2^N)", sc: "O(N) recursion", verdict: "Sub-optimal", date: "May 18, 2026", optimized: false },
  { id: 5, problem: "Course Schedule II", platform: "LeetCode", lang: "Java 17", tc: "O(V + E)", sc: "O(V + E) adjlist", verdict: "Optimal", date: "May 15, 2026", optimized: true },
  { id: 6, problem: "Binary Tree Maximum Path Sum", platform: "LeetCode", lang: "C++ 20", tc: "O(N)", sc: "O(H) stack", verdict: "Optimal", date: "May 12, 2026", optimized: true },
  { id: 7, problem: "XOR-Construction", platform: "Codeforces", lang: "C++ 20", tc: "O(N log N)", sc: "O(N) trie", verdict: "Sub-optimal", date: "May 10, 2026", optimized: false }
];

function AnalysisContent() {
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("All"); // All | C++ 20 | Python 3.10
  const [verdictFilter, setVerdictFilter] = useState("All"); // All | Optimal | Sub-optimal

  const filteredAnalyses = useMemo(() => {
    return INITIAL_ANALYSES.filter(item => {
      const matchesSearch = item.problem.toLowerCase().includes(search.toLowerCase()) || 
                            item.tc.toLowerCase().includes(search.toLowerCase());

      const matchesLang = langFilter === "All" || item.lang.includes(langFilter);
      const matchesVerdict = verdictFilter === "All" || item.verdict === verdictFilter;

      return matchesSearch && matchesLang && matchesVerdict;
    });
  }, [search, langFilter, verdictFilter]);

  const stats = useMemo(() => {
    const total = INITIAL_ANALYSES.length;
    const optimal = INITIAL_ANALYSES.filter(a => a.verdict === "Optimal").length;
    return {
      total,
      optimal,
      rate: Math.round((optimal / total) * 100)
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Chrome Extension Integration Banner */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)", borderColor: "rgba(99, 102, 241, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)", color: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={22} className="pulse-green" style={{ color: "var(--primary-light)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", margin: "0", textAlign: "left" }}>Chrome Extension Vault</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0" }}>
              Complexity analyses automatically pushed to your account from the **Algo Mentor Chrome Extension**.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Analyses Pushed</span>
            <h4 style={{ fontSize: "1.3rem", color: "white", margin: "0" }}>{stats.total} Solutions</h4>
          </div>
          <div style={{ height: "30px", width: "1px", background: "var(--border-ice)" }} />
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Optimality Index</span>
            <h4 style={{ fontSize: "1.3rem", color: "var(--text-success)", margin: "0" }}>{stats.rate}% Optimal</h4>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", padding: "0.85rem 1rem", alignItems: "center" }}>
        
        {/* Search Input */}
        <div style={{ position: "relative", flexGrow: "1", minWidth: "200px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search problems, time complexities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem", height: "40px", backgroundColor: "rgba(8,11,17,0.5)" }}
          />
        </div>

        {/* Filters dropdown */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Language</span>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", height: "34px", width: "110px" }}
            >
              <option value="All">All Langs</option>
              <option value="C++">C++</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Verdict</span>
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", height: "34px", width: "110px" }}
            >
              <option value="All">All Verdicts</option>
              <option value="Optimal">Optimal</option>
              <option value="Sub-optimal">Sub-optimal</option>
            </select>
          </div>
        </div>

      </div>

      {/* 3. Analyses Table Grid */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {filteredAnalyses.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <p>No complexity analyses found matching active search criteria.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Problem Name</th>
                  <th>Platform</th>
                  <th>Language</th>
                  <th>Time Complexity (TC)</th>
                  <th>Space Complexity (SC)</th>
                  <th>Verdict</th>
                  <th>Date Sync</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{item.problem}</span>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "2px", marginTop: "2px" }}>
                          Synced via Chrome
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.6rem" }}>
                        {item.platform}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.lang}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: "700", color: "white" }}>{item.tc}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.sc}</td>
                    <td>
                      <span className={`badge ${item.optimized ? "badge-easy" : "badge-hard"}`} style={{ fontSize: "0.6rem", padding: "0.25rem 0.5rem" }}>
                        {item.verdict}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integration help card */}
      <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(16, 185, 129, 0.03)", borderColor: "rgba(16, 185, 129, 0.15)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "var(--text-success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
          <Sparkles size={18} />
        </div>
        <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          Make sure your Chrome extension status pill in the upper-right header reads **"Connected"**. When connected, any accepted submission on LeetCode automatically sends its runtime AST structure to the AI compiler backend, registering optimal metrics in real-time.
        </p>
      </div>

    </div>
  );
}

function Analysis() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AnalysisContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Analysis;
