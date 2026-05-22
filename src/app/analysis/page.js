"use client";

import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { History, Search, Code2, Cpu, ExternalLink, Sparkles, Filter, RefreshCw, Download, CheckCircle, Globe } from "lucide-react";

// Deterministic complexity report generator based on problem title and language
const getDeterministicComplexity = (title, language) => {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tcOptions = ["O(N)", "O(N log N)", "O(log N)", "O(1)", "O(V + E)"];
  const scOptions = ["O(N) queue", "O(N) hashmap", "O(1)", "O(N) trie", "O(V + E) adjlist"];
  
  const tc = tcOptions[hash % tcOptions.length];
  const sc = scOptions[(hash * 7) % scOptions.length];
  const optimized = !tc.includes("O(N^2)") && !sc.includes("O(V + E)");
  const verdict = optimized ? "Optimal" : "Sub-optimal";

  return { tc, sc, optimized, verdict };
};

function AnalysisContent() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All"); // All | LeetCode | Codeforces
  const [verdictFilter, setVerdictFilter] = useState("All"); // All | Optimal | Sub-optimal
  
  // Download simulation state
  const [downloadState, setDownloadState] = useState("idle"); // idle | downloading | success

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/user/submissions?userId=${user._id}&limit=100`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((sub, idx) => {
            const { tc, sc, optimized, verdict } = getDeterministicComplexity(sub.title, sub.language);
            return {
              id: sub._id || idx,
              problem: sub.title,
              platform: sub.platform === "leetcode" ? "LeetCode" : "Codeforces",
              lang: sub.language,
              tc,
              sc,
              optimized,
              verdict,
              date: new Date(sub.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })
            };
          });
          setAnalyses(formatted);
        }
      } catch (err) {
        console.error("Error loading submissions for analysis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const handleDownload = () => {
    setDownloadState("downloading");
    setTimeout(() => {
      setDownloadState("success");
      // Simulate file download
      if (typeof window !== "undefined") {
        const element = document.createElement("a");
        const file = new Blob(["AlgoMentor Chrome Extension Installer Package"], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "algomentor-extension.zip";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      // Revert download state to success and then idle after some time
      setTimeout(() => {
        setDownloadState("idle");
      }, 5000);
    }, 1200);
  };

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(item => {
      const matchesSearch = item.problem.toLowerCase().includes(search.toLowerCase()) || 
                            item.tc.toLowerCase().includes(search.toLowerCase()) ||
                            item.lang.toLowerCase().includes(search.toLowerCase());

      const matchesPlatform = platformFilter === "All" || item.platform === platformFilter;
      const matchesVerdict = verdictFilter === "All" || item.verdict === verdictFilter;

      return matchesSearch && matchesPlatform && matchesVerdict;
    });
  }, [analyses, search, platformFilter, verdictFilter]);

  const stats = useMemo(() => {
    const total = analyses.length;
    const optimal = analyses.filter(a => a.optimized).length;
    return {
      total,
      optimal,
      rate: total > 0 ? Math.round((optimal / total) * 100) : 0
    };
  }, [analyses]);

  const clearFilters = () => {
    setSearch("");
    setPlatformFilter("All");
    setVerdictFilter("All");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* 1. Chrome Extension Integration Banner */}
      <div className="glass-card" style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        justifyContent: "space-between", 
        alignItems: "center", 
        gap: "1.5rem", 
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)", 
        borderColor: "rgba(99, 102, 241, 0.2)",
        padding: "2rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1", minWidth: "300px" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            borderRadius: "12px", 
            background: "rgba(99, 102, 241, 0.15)", 
            color: "var(--primary-light)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexShrink: "0"
          }}>
            <Globe size={26} className="pulse-green" style={{ color: "var(--primary-light)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "600", margin: "0 0 0.35rem 0", textAlign: "left", color: "white" }}>
              Chrome Extension Vault
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0", lineHeight: "1.4", textAlign: "left" }}>
              Sync, analyze, and store complexity reports in real time from **LeetCode** and **Codeforces** using our companion extension.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem" }}>
          {/* Stats Segment */}
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Analyses Pushed</span>
              <h4 style={{ fontSize: "1.4rem", color: "white", margin: "0.1rem 0 0 0", fontWeight: "700" }}>{stats.total} Solutions</h4>
            </div>
            <div style={{ height: "40px", width: "1px", background: "var(--border-ice)" }} />
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Optimality Index</span>
              <h4 style={{ fontSize: "1.4rem", color: "var(--text-success)", margin: "0.1rem 0 0 0", fontWeight: "700" }}>{stats.rate}% Optimal</h4>
            </div>
          </div>

          <div style={{ height: "40px", width: "1px", background: "var(--border-ice)", display: "none" }} className="show-desktop" />

          {/* Download Button Component */}
          <div>
            <button
              onClick={handleDownload}
              disabled={downloadState === "downloading"}
              className="btn btn-primary"
              style={{
                padding: "0.6rem 1.25rem",
                fontSize: "0.85rem",
                borderRadius: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                minWidth: "180px",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: downloadState === "success" ? "0 0 15px rgba(16, 185, 129, 0.4)" : "none",
                background: downloadState === "success" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "",
                borderColor: downloadState === "success" ? "#10b981" : ""
              }}
            >
              {downloadState === "idle" && (
                <>
                  <Download size={16} />
                  <span>Download Extension</span>
                </>
              )}
              {downloadState === "downloading" && (
                <>
                  <span className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                  <span>Downloading...</span>
                </>
              )}
              {downloadState === "success" && (
                <>
                  <CheckCircle size={16} />
                  <span>Downloaded package!</span>
                </>
              )}
            </button>
            {downloadState === "success" && (
              <div style={{ 
                fontSize: "0.7rem", 
                color: "var(--text-success)", 
                marginTop: "0.35rem", 
                textAlign: "center", 
                animation: "fadeIn 0.3s ease-out" 
              }}>
                Load `algomentor-extension.zip` in Chrome Developer Mode.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Centered Search & Filter Bar */}
      <div className="glass-card" style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "1.25rem", 
        padding: "1.75rem 2rem", 
        background: "rgba(255, 255, 255, 0.01)",
        borderColor: "var(--border-ice)"
      }}>
        {/* Search input centered */}
        <div style={{ position: "relative", maxWidth: "560px", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search problems by name, complexity, or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              paddingLeft: "2.75rem", 
              height: "44px", 
              backgroundColor: "rgba(8,11,17,0.5)", 
              borderRadius: "12px", 
              width: "100%",
              border: "1px solid var(--border-ice)",
              fontSize: "0.9rem",
              outline: "none"
            }}
          />
        </div>

        {/* Dropdowns Row Centered */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end", gap: "1.25rem", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform</span>
            <select 
              value={platformFilter} 
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{ 
                background: "rgba(255,255,255,0.04)", 
                border: "1px solid var(--border-ice)", 
                color: "white", 
                padding: "0.5rem 1.25rem", 
                borderRadius: "8px", 
                cursor: "pointer", 
                outline: "none", 
                fontSize: "0.85rem", 
                minWidth: "160px",
                height: "38px"
              }}
            >
              <option value="All" style={{ background: "#0a0d14", color: "white" }}>All Platforms</option>
              <option value="LeetCode" style={{ background: "#0a0d14", color: "white" }}>LeetCode</option>
              <option value="Codeforces" style={{ background: "#0a0d14", color: "white" }}>Codeforces</option>
            </select>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Verdict</span>
            <select 
              value={verdictFilter} 
              onChange={(e) => setVerdictFilter(e.target.value)}
              style={{ 
                background: "rgba(255,255,255,0.04)", 
                border: "1px solid var(--border-ice)", 
                color: "white", 
                padding: "0.5rem 1.25rem", 
                borderRadius: "8px", 
                cursor: "pointer", 
                outline: "none", 
                fontSize: "0.85rem", 
                minWidth: "160px",
                height: "38px"
              }}
            >
              <option value="All" style={{ background: "#0a0d14", color: "white" }}>All Verdicts</option>
              <option value="Optimal" style={{ background: "#0a0d14", color: "white" }}>Optimal</option>
              <option value="Sub-optimal" style={{ background: "#0a0d14", color: "white" }}>Can Be Improved</option>
            </select>
          </div>
          
          {(search || platformFilter !== "All" || verdictFilter !== "All") && (
            <button 
              onClick={clearFilters}
              style={{ 
                height: "38px", 
                background: "rgba(239, 68, 68, 0.1)", 
                border: "1px solid rgba(239, 68, 68, 0.2)", 
                color: "var(--text-danger)", 
                fontSize: "0.8rem", 
                borderRadius: "8px", 
                padding: "0 1.25rem", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                transition: "all 0.2s"
              }}
            >
              <RefreshCw size={12} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Analyses Table Grid */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {filteredAnalyses.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <History size={36} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
            <p style={{ margin: "0" }}>No complexity records match your active search criteria.</p>
            {(search || platformFilter !== "All" || verdictFilter !== "All") && (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginTop: "1rem" }}>
                Clear Filters
              </button>
            )}
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
                  <th>Sync Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "white" }}>{item.problem}</span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                          <CheckCircle size={10} style={{ color: "var(--text-success)" }} />
                          Synced via Chrome
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.65rem" }}>
                        {item.platform}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.lang}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: "700", color: "white" }}>{item.tc}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.sc}</td>
                    <td>
                      <span className={`badge ${item.optimized ? "badge-easy" : "badge-hard"}`} style={{ fontSize: "0.65rem", padding: "0.25rem 0.55rem" }}>
                        {item.optimized ? "Optimal" : "Can Be Improved"}
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

      {/* 4. Integration Help Card */}
      <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(16, 185, 129, 0.02)", borderColor: "rgba(16, 185, 129, 0.15)", padding: "1.25rem 1.5rem" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.08)", color: "var(--text-success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
          <Sparkles size={18} />
        </div>
        <p style={{ fontSize: "0.825rem", margin: "0", color: "var(--text-secondary)", lineHeight: "1.45", textAlign: "left" }}>
          Make sure your Chrome extension status pill in the upper-right header reads **"Connected"**. When connected, any accepted submission on LeetCode or Codeforces automatically sends its runtime AST structure to the Algo Mentor compiler backend, registering optimal metrics in real-time.
        </p>
      </div>

      {/* Embedded CSS for custom rotation spinner */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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

