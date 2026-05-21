"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, ExternalLink, Sparkles, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

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
  const router = useRouter();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Load tag filter from query param on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tagParam = params.get("tag");
      if (tagParam) {
        // Find if the tag is valid in our tag set
        const normalized = tagParam.toLowerCase();
        setSelectedTags([normalized]);
      }
    }
  }, []);

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    setPage(1);
  };

  const toggleDifficulty = (d) => {
    setSelectedDifficulties(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    setPage(1);
  };

  const toggleTag = (t) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedPlatforms([]);
    setSelectedDifficulties([]);
    setSelectedTags([]);
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
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(prob.platform);

      // Difficulty match
      const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(prob.difficulty);

      // Tag match
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => prob.tags.includes(t));

      return matchesSearch && matchesPlatform && matchesDifficulty && matchesTags;
    });
  }, [search, selectedPlatforms, selectedDifficulties, selectedTags]);

  // Paginated slice
  const paginatedProblems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / itemsPerPage));

  const handleAskAI = (problem) => {
    // Redirect to AI mentor chat, pre-filling a simulated query
    router.push(`/mentor?problem=${encodeURIComponent(problem.title)}&platform=${encodeURIComponent(problem.platform)}`);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem" }} className="problems-grid-layout">
      
      {/* 1. Left Sidebar Filters */}
      <div className="glass-card" style={{ height: "fit-content", display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyBetween: "space-between", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={14} style={{ color: "var(--primary-light)" }} />
            <h3 style={{ fontSize: "0.95rem" }}>Filters</h3>
          </div>
          <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", padding: "0" }}>
            <RefreshCw size={10} />
            Reset
          </button>
        </div>

        {/* Platform section */}
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Platform</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {["LeetCode", "Codeforces"].map((p) => (
              <label key={p} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                  style={{ width: "14px", height: "14px", cursor: "pointer" }}
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty section */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Difficulty</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {["Easy", "Medium", "Hard", "Div1", "Div2"].map((d) => (
              <label key={d} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={selectedDifficulties.includes(d)}
                  onChange={() => toggleDifficulty(d)}
                  style={{ width: "14px", height: "14px", cursor: "pointer" }}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Popular tags section */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Topic Tags</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["arrays", "DP", "trees", "strings", "sliding window", "binary search", "graphs"].map((t) => {
              const active = selectedTags.includes(t);
              return (
                <span
                  key={t}
                  onClick={() => toggleTag(t)}
                  style={{
                    fontSize: "0.65rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: active ? "var(--primary-gradient)" : "rgba(255,255,255,0.04)",
                    color: active ? "white" : "var(--text-secondary)",
                    border: `1px solid ${active ? "transparent" : "var(--border-ice)"}`,
                    transition: "all 0.15s"
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Problems Table area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* Search Header */}
        <div className="glass-card" style={{ display: "flex", gap: "1rem", padding: "0.85rem 1rem", alignItems: "center" }}>
          <div style={{ position: "relative", flexGrow: "1" }}>
            <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search problems by name or tags..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: "2.5rem", height: "40px", backgroundColor: "rgba(8,11,17,0.5)" }}
            />
          </div>
          
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: "0" }}>
            Found {filteredProblems.length} results
          </span>
        </div>

        {/* Problems Table Grid */}
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          {paginatedProblems.length === 0 ? (
            <div style={{ padding: "3rem", textAlignment: "center", textAlign: "center", color: "var(--text-secondary)" }}>
              <p style={{ marginBottom: "0.5rem" }}>No problems matched your active filters</p>
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
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem" }}
                            title="Ask Algo Mentor for review!"
                            onClick={() => handleAskAI(prob)}
                          >
                            <Sparkles size={12} style={{ color: "var(--text-warning)" }} />
                            <span>Ask AI</span>
                          </button>
                          
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            <span>Open</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
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

      <style jsx global>{`
        @media (max-width: 768px) {
          .problems-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

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
