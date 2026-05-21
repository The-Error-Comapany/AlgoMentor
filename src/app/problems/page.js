"use client";

import { useState, useMemo, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const INITIAL_PROBLEMS = [
  { id: 1, title: "Two Sum", platform: "LeetCode", difficulty: "Easy", tags: ["arrays", "hashing"], url: "https://leetcode.com/problems/two-sum/" },
  { id: 2, title: "Sliding Window Maximum", platform: "LeetCode", difficulty: "Hard", tags: ["sliding window", "queue"], url: "https://leetcode.com/problems/sliding-window-maximum/" },
  { id: 3, title: "Edit Distance", platform: "LeetCode", difficulty: "Hard", tags: ["DP", "strings"], url: "https://leetcode.com/problems/edit-distance/" },
  { id: 4, title: "K-th Tree Diameter", platform: "Codeforces", difficulty: "Div1", tags: ["trees", "graphs", "DP"], url: "https://codeforces.com/problemset/problem/1883/G2" },
  { id: 5, title: "Valid Parentheses", platform: "LeetCode", difficulty: "Easy", tags: ["strings", "stack"], url: "https://leetcode.com/problems/valid-parentheses/" },
  { id: 6, title: "Minimum Path Sum", platform: "LeetCode", difficulty: "Medium", tags: ["DP", "grid"], url: "https://leetcode.com/problems/minimum-path-sum/" },
  { id: 7, title: "XOR-Construction", platform: "Codeforces", difficulty: "Div2", tags: ["constructive", "math", "bitmasks"], url: "https://codeforces.com/problemset/problem/1895/D" },
  { id: 8, title: "Binary Tree Maximum Path Sum", platform: "LeetCode", difficulty: "Hard", tags: ["trees", "graphs", "DFS"], url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
  { id: 9, title: "Product of Array Except Self", platform: "LeetCode", difficulty: "Medium", tags: ["arrays", "prefix-sum"], url: "https://leetcode.com/problems/product-of-array-except-self/" },
  { id: 10, title: "Longest Common Subsequence", platform: "LeetCode", difficulty: "Medium", tags: ["DP", "strings"], url: "https://leetcode.com/problems/longest-common-subsequence/" },
  { id: 11, title: "Watering Flowers", platform: "Codeforces", difficulty: "Div2", tags: ["binary search", "geometry"], url: "https://codeforces.com/problemset/problem/617/D" },
  { id: 12, title: "Container With Most Water", platform: "LeetCode", difficulty: "Medium", tags: ["two pointers", "arrays"], url: "https://leetcode.com/problems/container-with-most-water/" }
];

function ProblemsContent() {
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

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
    return INITIAL_PROBLEMS.filter((prob) => {
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
  }, [search, selectedPlatform, selectedDifficulty, selectedTag]);

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
              <option value="Div1" style={{ background: "#0a0d14", color: "white" }}>Div1 (CF)</option>
              <option value="Div2" style={{ background: "#0a0d14", color: "white" }}>Div2 (CF)</option>
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
                      <td style={{ fontWeight: "600", fontSize: "0.9rem" }}>{prob.title}</td>
                      <td>
                        <span className={`badge ${prob.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`}>
                          {prob.platform}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${prob.difficulty === "Easy" ? "badge-easy" : prob.difficulty === "Hard" || prob.difficulty === "Div1" ? "badge-hard" : "badge-medium"}`}>
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
