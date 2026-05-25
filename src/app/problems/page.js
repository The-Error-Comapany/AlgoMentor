"use client";

import { useState, useMemo, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Search, ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { allProblems } from "@/lib/problemsData";

// Deterministic parsed problems from actual synced submissions
const getDeterministicProblemInfo = (title, platform, titleSlug) => {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const difficulty = platform === "leetcode"
    ? (hash % 3 === 0 ? "Easy" : hash % 3 === 1 ? "Medium" : "Hard")
    : (hash % 2 === 0 ? "Div2" : "Div1");

  const allTags = ["arrays", "hashing", "sliding window", "queue", "DP", "strings", "trees", "graphs", "math", "bitmasks", "two pointers", "stack"];
  const tags = [
    allTags[hash % allTags.length],
    allTags[(hash * 3) % allTags.length]
  ].filter((v, i, a) => a.indexOf(v) === i);

  const url = platform === "leetcode"
    ? `https://leetcode.com/problems/${titleSlug || title.toLowerCase().replace(/ /g, "-")}/`
    : `https://codeforces.com/problemset/problem/${titleSlug || "1800/A"}`;

  return { difficulty, tags, url };
};

function ProblemsContent() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setProblems(allProblems);
    setLoading(false);
  }, []);

  // Load tag filter from query param on mount if clicked from dashboard/elsewhere
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tagParam = params.get("tag");
      if (tagParam) {
        setSelectedTag(tagParam.toLowerCase());
      }
    }
  }, []);

  const clearFilters = () => {
    setSelectedPlatform("All");
    setSelectedDifficulty("All");
    setSelectedTag("All");
    setSearch("");
    setPage(1);
  };

  // Memoized filter list of problems
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      // Search text match
      const matchesSearch = prob.title.toLowerCase().includes(search.toLowerCase()) || 
                            prob.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

      // Platform match
      const matchesPlatform = selectedPlatform === "All" || prob.platform === selectedPlatform;

      // Difficulty match
      const matchesDifficulty = selectedDifficulty === "All" || prob.difficulty === selectedDifficulty;

      // Tag match
      const matchesTags = selectedTag === "All" || prob.tags.includes(selectedTag);

      return matchesSearch && matchesPlatform && matchesDifficulty && matchesTags;
    });
  }, [problems, search, selectedPlatform, selectedDifficulty, selectedTag]);

  // Paginated slice
  const paginatedProblems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / itemsPerPage));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* 1. Header Centered Search and Filter Bar */}
      <div className="glass-card" style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "1.25rem", 
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)",
        borderColor: "rgba(255, 255, 255, 0.08)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>Practice Library</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0" }}>
            Curated list of premium LeetCode and Codeforces coding challenges
          </p>
        </div>

        {/* Search input centered */}
        <div style={{ position: "relative", maxWidth: "560px", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search problems by name or tags..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ 
              paddingLeft: "2.75rem", 
              height: "46px", 
              backgroundColor: "rgba(8,11,17,0.5)", 
              borderRadius: "12px", 
              width: "100%",
              border: "1px solid var(--border-ice)",
              fontSize: "0.9rem"
            }}
          />
        </div>

        {/* Dropdowns Row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", width: "100%", marginTop: "0.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Platform</span>
            <select 
              value={selectedPlatform} 
              onChange={(e) => { setSelectedPlatform(e.target.value); setPage(1); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-ice)", color: "white", padding: "0.5rem 1.25rem", borderRadius: "8px", cursor: "pointer", outline: "none", fontSize: "0.85rem", minWidth: "150px" }}
            >
              <option value="All" style={{ background: "#0a0d14", color: "white" }}>All Platforms</option>
              <option value="LeetCode" style={{ background: "#0a0d14", color: "white" }}>LeetCode</option>
              <option value="Codeforces" style={{ background: "#0a0d14", color: "white" }}>Codeforces</option>
            </select>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Difficulty</span>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-ice)", color: "white", padding: "0.5rem 1.25rem", borderRadius: "8px", cursor: "pointer", outline: "none", fontSize: "0.85rem", minWidth: "150px" }}
            >
              <option value="All" style={{ background: "#0a0d14", color: "white" }}>All Difficulties</option>
              <option value="Easy" style={{ background: "#0a0d14", color: "white" }}>Easy</option>
              <option value="Medium" style={{ background: "#0a0d14", color: "white" }}>Medium</option>
              <option value="Hard" style={{ background: "#0a0d14", color: "white" }}>Hard</option>
              <option value="800" style={{ background: "#0a0d14", color: "white" }}>800 (CF)</option>
              <option value="900" style={{ background: "#0a0d14", color: "white" }}>900 (CF)</option>
              <option value="1000" style={{ background: "#0a0d14", color: "white" }}>1000 (CF)</option>
              <option value="1100" style={{ background: "#0a0d14", color: "white" }}>1100 (CF)</option>
              <option value="1200" style={{ background: "#0a0d14", color: "white" }}>1200 (CF)</option>
              <option value="1300" style={{ background: "#0a0d14", color: "white" }}>1300 (CF)</option>
              <option value="1400" style={{ background: "#0a0d14", color: "white" }}>1400 (CF)</option>
              <option value="1500" style={{ background: "#0a0d14", color: "white" }}>1500 (CF)</option>
              <option value="1600" style={{ background: "#0a0d14", color: "white" }}>1600 (CF)</option>
              <option value="1700" style={{ background: "#0a0d14", color: "white" }}>1700 (CF)</option>
              <option value="1800" style={{ background: "#0a0d14", color: "white" }}>1800 (CF)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Topic Tag</span>
            <select 
              value={selectedTag} 
              onChange={(e) => { setSelectedTag(e.target.value); setPage(1); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-ice)", color: "white", padding: "0.5rem 1.25rem", borderRadius: "8px", cursor: "pointer", outline: "none", fontSize: "0.85rem", minWidth: "150px" }}
            >
              <option value="All" style={{ background: "#0a0d14", color: "white" }}>All Topics</option>
              {["arrays", "DP", "trees", "strings", "sliding window", "binary search", "graphs", "constructive", "math", "bitmasks", "two pointers", "queue", "stack", "hashing"].map(t => (
                <option key={t} value={t} style={{ background: "#0a0d14", color: "white" }}>{t}</option>
              ))}
            </select>
          </div>
          
          {(search || selectedPlatform !== "All" || selectedDifficulty !== "All" || selectedTag !== "All") && (
            <button 
              onClick={clearFilters}
              style={{ 
                alignSelf: "flex-end", 
                height: "38px", 
                background: "rgba(239, 68, 68, 0.1)", 
                border: "1px solid rgba(239, 68, 68, 0.2)", 
                color: "var(--text-danger)", 
                fontSize: "0.8rem", 
                borderRadius: "8px", 
                padding: "0 1rem", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                transition: "all 0.2s"
              }}
            >
              <RefreshCw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Problems Table */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          {paginatedProblems.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <p style={{ marginBottom: "1rem" }}>No problems matched your active filters</p>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear All Filters</button>
            </div>
          ) : (
            <div className="table-container" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Problem Name</th>
                    <th>Platform</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProblems.map((prob) => (
                    <tr key={prob.id}>
                      <td>
                        <a 
                          href={prob.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: "0.9rem", fontWeight: "600", textDecoration: "none", color: "white" }}
                          className="link-hover"
                          onMouseOver={(e) => e.currentTarget.style.color = "var(--primary-light)"}
                          onMouseOut={(e) => e.currentTarget.style.color = "white"}
                        >
                          {prob.title}
                        </a>
                      </td>
                      <td>
                        <span className={`badge ${prob.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`}>
                          {prob.platform}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          prob.difficulty === "Easy" || (prob.platform === "Codeforces" && parseInt(prob.difficulty) <= 1000)
                            ? "badge-easy" 
                            : prob.difficulty === "Hard" || (prob.platform === "Codeforces" && parseInt(prob.difficulty) >= 1500) 
                              ? "badge-hard" 
                              : "badge-medium"
                        }`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {prob.tags.map(t => (
                            <span key={t} style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.03)", padding: "0.15rem 0.35rem", borderRadius: "4px", color: "var(--text-secondary)", border: "1px solid var(--border-ice)" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <span>Open</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controllers */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Showing {Math.min(filteredProblems.length, (page - 1) * itemsPerPage + 1)}-{Math.min(filteredProblems.length, page * itemsPerPage)} of {filteredProblems.length} problems
            </span>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: "0.35rem", borderRadius: "8px" }}
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${page === p ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "32px", height: "32px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: "0.35rem", borderRadius: "8px" }}
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Problems() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProblemsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Problems;
