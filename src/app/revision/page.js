"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Brain, Plus, Sliders, X, Play, TrendingUp, CheckCircle, 
  ExternalLink, Sparkles, AlertTriangle, RefreshCw, BarChart2, List
} from "lucide-react";
import { allProblems } from "@/lib/problemsData";
import { 
  fetchRevisionItems, 
  addRevisionItem, 
  updateDailyLimit, 
  deleteRevisionItem 
} from "@/services/revisionService";
import "./Revision.css";

function RevisionHubContent() {
  const router = useRouter();

  // State Variables
  const [loading, setLoading] = useState(true);
  const [revisionData, setRevisionData] = useState({
    dueToday: [],
    allRevisionItems: [],
    overallReadinessScore: 0,
    topicScores: {},
    weakTopics: [],
    completedTodayCount: 0,
    maxReviewsPerDay: 10,
    totalDueCount: 0
  });

  const [showAddLibraryModal, setShowAddLibraryModal] = useState(false);
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Daily limit editor state
  const [limitVal, setLimitVal] = useState(10);
  const [updatingLimit, setUpdatingLimit] = useState(false);

  // Form States
  const [confidence, setConfidence] = useState(3);
  const [correctness, setCorrectness] = useState(true);
  const [timeTaken, setTimeTaken] = useState(20);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(1);

  // Library Problem select states
  const [selectedLibraryId, setSelectedLibraryId] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");

  // External Problem form states
  const [extTitle, setExtTitle] = useState("");
  const [extUrl, setExtUrl] = useState("");
  const [extDifficulty, setExtDifficulty] = useState("Medium");
  const [extTags, setExtTags] = useState([]); // Array of strings
  
  // AI Generation States
  const [addMethod, setAddMethod] = useState(null); // 'quick' | 'solution' | null
  const [patternUsed, setPatternUsed] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [programmingLanguage, setProgrammingLanguage] = useState("Python");
  const [solutionCode, setSolutionCode] = useState("");
  
  const ALL_TOPICS = [
    "Arrays", "Strings", "Trees", "Graphs", "DP", "Dynamic Programming", 
    "Sliding Window", "Binary Search", "Backtracking", "Heap", 
    "Linked List", "Stack", "Queue", "Greedy", "Two Pointers"
  ];

  // Confidence Rating Labels
  const confidenceLabels = [
    { value: 1, name: "No Idea", desc: "Forgot completely / Couldn't start" },
    { value: 2, name: "Vague Recall", desc: "Remembered basic idea, needed heavy help" },
    { value: 3, name: "Moderate Recall", desc: "Solved it but required coding hints" },
    { value: 4, name: "Good Recall", desc: "Solved with minor syntax bugs/inefficiency" },
    { value: 5, name: "Mastered", desc: "Solved optimally and quickly" }
  ];

  // Load Revision Hub Data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRevisionItems();
      if (data.success) {
        setRevisionData(data);
        setLimitVal(data.maxReviewsPerDay);
      }
    } catch (err) {
      console.error("Failed to load revision hub data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter library problems for Add Problem Modal
  const filteredLibraryProblems = useMemo(() => {
    if (!librarySearch.trim()) return allProblems;
    return allProblems
      .filter(p => p.title.toLowerCase().includes(librarySearch.toLowerCase()));
  }, [librarySearch]);

  // Handle setting daily review limit
  const handleSaveLimit = async () => {
    setUpdatingLimit(true);
    try {
      const res = await updateDailyLimit(Number(limitVal));
      if (res.success) {
        setRevisionData(prev => ({
          ...prev,
          maxReviewsPerDay: res.maxReviewsPerDay
        }));
        loadData(); // reload to re-slice due items
      }
    } catch (err) {
      console.error("Failed to save limit", err);
    } finally {
      setUpdatingLimit(false);
    }
  };

  // Reset Form States
  const resetForm = () => {
    setConfidence(3);
    setCorrectness(true);
    setTimeTaken(20);
    setHintsUsed(0);
    setSubmissionCount(1);
    setSelectedLibraryId("");
    setLibrarySearch("");
    setExtTitle("");
    setExtUrl("");
    setExtDifficulty("Medium");
    setExtTags([]);
    setAddMethod(null);
    setPatternUsed("");
    setPersonalNotes("");
    setProgrammingLanguage("Python");
    setSolutionCode("");
    setErrorMessage("");
  };

  // Submit Add From Library
  const handleAddLibraryProblem = async (e) => {
    e.preventDefault();
    if (!selectedLibraryId) {
      setErrorMessage("Please select a problem from the library.");
      return;
    }

    const selectedProb = allProblems.find(p => p.id === selectedLibraryId);
    if (!selectedProb) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        problemId: selectedProb.id,
        title: selectedProb.title,
        platform: selectedProb.platform,
        url: selectedProb.url,
        difficulty: selectedProb.difficulty,
        tags: selectedProb.tags,
        pattern: addMethod === "quick" ? patternUsed : "",
        source: "library",
        confidence,
        correctness,
        timeTaken: Number(timeTaken),
        hintsUsed: Number(hintsUsed),
        submissionCount: Number(submissionCount),
        generationStrategy: addMethod,
        personalNotes: addMethod === "quick" ? personalNotes : "",
        programmingLanguage: addMethod === "solution" ? programmingLanguage : "",
        solutionCode: addMethod === "solution" ? solutionCode : ""
      };

      const res = await addRevisionItem(payload);
      if (res.success) {
        setShowAddLibraryModal(false);
        resetForm();
        loadData();
      } else {
        setErrorMessage(res.message || "Failed to add problem.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Add External Problem
  const handleAddExternalProblem = async (e) => {
    e.preventDefault();
    if (!extTitle.trim() || !extUrl.trim()) {
      setErrorMessage("Please fill out the problem title and URL.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        title: extTitle,
        platform: extUrl.toLowerCase().includes("leetcode.com") ? "LeetCode" : 
                  extUrl.toLowerCase().includes("codeforces.com") ? "Codeforces" : 
                  extUrl.toLowerCase().includes("atcoder.jp") ? "AtCoder" : 
                  extUrl.toLowerCase().includes("geeksforgeeks.org") ? "GeeksforGeeks" : "Other",
        url: extUrl,
        difficulty: extDifficulty,
        tags: extTags.length > 0 ? extTags : ["external"],
        pattern: addMethod === "quick" ? patternUsed : "",
        source: "external",
        confidence,
        correctness,
        timeTaken: Number(timeTaken),
        hintsUsed: Number(hintsUsed),
        submissionCount: Number(submissionCount),
        generationStrategy: addMethod,
        personalNotes: addMethod === "quick" ? personalNotes : "",
        programmingLanguage: addMethod === "solution" ? programmingLanguage : "",
        solutionCode: addMethod === "solution" ? solutionCode : ""
      };

      const res = await addRevisionItem(payload);
      if (res.success) {
        setShowAddExternalModal(false);
        resetForm();
        loadData();
      } else {
        setErrorMessage(res.message || "Failed to add problem.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete problem handler
  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to remove this problem from Revision Hub?")) return;
    try {
      const res = await deleteRevisionItem(id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete revision item", err);
    }
  };

  if (loading && revisionData.allRevisionItems.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <RefreshCw size={24} className="pulse-yellow" style={{ animation: "spin 2s linear infinite" }} />
        <span style={{ marginLeft: "10px" }}>Loading Revision Hub Diagnostics...</span>
      </div>
    );
  }

  // Recommendations Today list
  const recommendedToday = revisionData.dueToday.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* Header Row */}
      <div className="rev-header-row">
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0" }}>
            Concept spaced-repetition and cognitive strength metrics
          </p>
        </div>
        <div className="rev-action-buttons">
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => router.push("/revision/list")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <List size={14} />
            <span>View All</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => { resetForm(); setShowAddLibraryModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} />
            <span>Add From Library</span>
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => { resetForm(); setShowAddExternalModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} />
            <span>Add External Problem</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid-4 rev-stats-grid">
        <div className="glass-card rev-readiness-circle-container">
          <div className="rev-readiness-circle" style={{ "--percentage": revisionData.overallReadinessScore }}>
            <div className="rev-readiness-text">{revisionData.overallReadinessScore}%</div>
          </div>
          <div>
            <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Readiness Score</h4>
            <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-muted)" }}>Overall Mastery Rating</p>
          </div>
        </div>

        <div className="glass-card">
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Due Reviews</h4>
          <div className="rev-stat-value">{revisionData.totalDueCount}</div>
          <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-muted)" }}>Problems pending revision</p>
        </div>

        <div className="glass-card">
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Tracked Problems</h4>
          <div className="rev-stat-value">{revisionData.allRevisionItems.length}</div>
          <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-muted)" }}>Total active in engine</p>
        </div>

        <div className="glass-card">
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Completed Today</h4>
          <div className="rev-stat-value" style={{ color: "var(--text-success)" }}>{revisionData.completedTodayCount}</div>
          <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-muted)" }}>Done since midnight</p>
        </div>
      </div>

      {/* Core Split Layout */}
      <div className="grid-2" style={{ alignItems: "start" }}>
        
        {/* Left Column: Due Today Dashboard Queue */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Brain size={18} style={{ color: "var(--primary-light)" }} />
              Due Today Review Queue
            </h3>
            {revisionData.dueToday.length > 0 && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => router.push("/revision/session")}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Play size={12} fill="white" />
                <span>Start Review</span>
              </button>
            )}
          </div>

          {/* Daily limit setting input */}
          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-ice)", borderRadius: "10px", padding: "0.75rem" }}>
            <h4 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", margin: "0 0 6px" }}>
              Daily Review Limit settings
            </h4>
            <div className="rev-limit-panel">
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Show max reviews per day:</span>
              <input
                type="number"
                className="rev-limit-input"
                value={limitVal}
                onChange={(e) => setLimitVal(e.target.value)}
                min="1"
                max="100"
              />
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleSaveLimit}
                disabled={updatingLimit}
                style={{ padding: "0.35rem 0.75rem", height: "30px", fontSize: "0.75rem" }}
              >
                {updatingLimit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Due List */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: "150px" }}>
            {revisionData.dueToday.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={32} style={{ color: "var(--text-success)" }} />
                <span style={{ fontWeight: "600" }}>All caught up! 🎉</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  No reviews due today. Add more solved problems or adjust your daily limit.
                </span>
              </div>
            ) : (
              revisionData.dueToday.map((item) => (
                <div key={item._id} className="rev-due-item-row">
                  <div className="rev-due-left">
                    <a href={item.url} target="_blank" rel="noreferrer" className="rev-due-title">
                      {item.title}
                    </a>
                    <div className="rev-due-meta">
                      <span className={`badge ${
                        item.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"
                      }`} style={{ fontSize: "0.55rem", padding: "0.1rem 0.3rem" }}>
                        {item.platform}
                      </span>
                      <span>•</span>
                      <span style={{ textTransform: "capitalize" }}>EF {item.easinessFactor?.toFixed(1)}</span>
                      <span>•</span>
                      <span className={`rev-due-priority ${
                        item.priorityScore >= 70 ? "rev-priority-high" : 
                        item.priorityScore >= 45 ? "rev-priority-med" : "rev-priority-low"
                      }`}>
                        Priority {item.priorityScore}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteItem(item._id)}
                      style={{ padding: "0.35rem", borderRadius: "8px" }}
                      title="Remove from Revision Hub"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Strength Readiness Dashboard */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} style={{ color: "var(--primary-light)" }} />
              Strength Readiness Dashboard
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => router.push("/revision/analytics")}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <BarChart2 size={12} />
              <span>Full Analytics</span>
            </button>
          </div>

          {/* Recommendations alert */}
          <div className="rev-recommendation-card" style={{ background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent-color)", padding: "0.85rem", borderRadius: "8px" }}>
            <h4 style={{ fontSize: "0.8rem", color: "white", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 6px" }}>
              <Sparkles size={14} style={{ color: "var(--text-warning)" }} />
              Engine Recommendations
            </h4>
            {revisionData.weakTopics.length > 0 ? (
              <div>
                <p style={{ fontSize: "0.75rem", margin: "0 0 6px", color: "var(--text-secondary)" }}>
                  Weak areas detected: <strong style={{ color: "var(--text-danger)" }}>{revisionData.weakTopics.join(", ")}</strong>
                </p>
                {recommendedToday.length > 0 && (
                  <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-secondary)" }}>
                    Recommended today: <strong style={{ color: "white" }}>{recommendedToday.map(r => r.title).join(", ")}</strong>
                  </p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-secondary)" }}>
                You have healthy topic scores! Keep adding solved problems to maintainspaced-repetition tracking.
              </p>
            )}
          </div>

          {/* Topic mastery list */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "0.5rem" }}>
            {Array.from(new Set([
              "arrays", "strings", "trees", "graphs", "dp", 
              "binary search", "two pointers", "sliding window", "backtracking", "linked list", "stack", "greedy", "heap",
              ...(Object.keys(revisionData.topicScores || {}))
            ])).map((topic) => {
              const score = revisionData.topicScores[topic] !== undefined ? revisionData.topicScores[topic] : 100;
              
              // Formatting the display topic
              let displayTopic = topic;
              if (topic === "dp") displayTopic = "Dynamic Programming";
              else if (topic === "dfs") displayTopic = "DFS";
              else if (topic === "bfs") displayTopic = "BFS";
              else {
                displayTopic = topic.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              }
              
              return (
                <div key={topic} className="rev-topic-progress-row">
                  <div className="rev-topic-progress-header">
                    <span>{displayTopic}</span>
                    <span style={{ fontWeight: "700", color: score < 60 ? "var(--text-danger)" : "white" }}>{score}%</span>
                  </div>
                  <div className="rev-topic-progress-bar-bg">
                    <div className="rev-topic-progress-bar-fill" style={{ width: `${score}%` }} />
                  </div>
                  {score < 60 && <span className="rev-topic-weak-tag">Weak Topic</span>}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ================= ADD FROM LIBRARY MODAL ================= */}
      {showAddLibraryModal && (
        <div className="rev-modal-overlay">
          <div className="rev-modal">
            <div className="rev-modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>Add Solved Problem from Library</h3>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem", borderRadius: "50%" }} onClick={() => setShowAddLibraryModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddLibraryProblem}>
              <div className="rev-modal-body">
                

                {/* Method Selection Step */}
                {!addMethod && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div 
                      onClick={() => setAddMethod("quick")}
                      style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-ice)", borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-ice)"}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "white" }}>Quick Add</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Fast setup using pattern and personal notes.</p>
                    </div>
                    <div 
                      onClick={() => setAddMethod("solution")}
                      style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-ice)", borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-ice)"}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧠</div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "white" }}>Add With Solution</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Advanced AI analysis using solution code.</p>
                    </div>
                  </div>
                )}

{errorMessage && (
                  <div style={{ padding: "0.6rem 0.85rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--text-danger)", fontSize: "0.75rem", marginBottom: "1rem" }}>
                    {errorMessage}
                  </div>
                )}

                {/* Library Problem Selector */}
                <div className="rev-form-group">
                  <label className="rev-form-label">Search & Select Problem</label>
                  <input
                    type="text"
                    placeholder="Search standard problems (e.g. Two Sum)..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <select
                    value={selectedLibraryId}
                    onChange={(e) => setSelectedLibraryId(e.target.value)}
                    style={{ background: "#0a0d14" }}
                  >
                    <option value="">-- Select problem --</option>
                    {filteredLibraryProblems.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.platform} - {p.difficulty})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Performance Signals Form Part */}
                
                {addMethod && (
                  <div style={{ borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "0.85rem", color: "white", margin: "0" }}>
                        {addMethod === "quick" ? "⚡ Quick Add Configuration" : "🧠 Solution Analysis Configuration"}
                      </h4>
                      <button type="button" onClick={() => setAddMethod(null)} className="btn btn-secondary btn-sm" style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}>Change Method</button>
                    </div>

                    {addMethod === "quick" && (
                      <>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Algorithm Pattern Used <span style={{color: "var(--danger)"}}>*</span></label>
                          <input
                            type="text"
                            placeholder="e.g. Sliding Window, BFS, Two Pointers"
                            value={patternUsed}
                            onChange={(e) => setPatternUsed(e.target.value)}
                            required
                          />
                        </div>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Personal Notes (Optional)</label>
                          <textarea
                            placeholder="Add your thought process, approach, or key constraints here..."
                            value={personalNotes}
                            onChange={(e) => setPersonalNotes(e.target.value)}
                            style={{ minHeight: "80px", resize: "vertical" }}
                          />
                        </div>
                      </>
                    )}

                    {addMethod === "solution" && (
                      <>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Programming Language</label>
                          <select value={programmingLanguage} onChange={(e) => setProgrammingLanguage(e.target.value)} style={{ background: "#0a0d14" }}>
                            <option value="Python">Python</option>
                            <option value="C++">C++</option>
                            <option value="Java">Java</option>
                            <option value="JavaScript">JavaScript</option>
                          </select>
                        </div>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Solution Code <span style={{color: "var(--danger)"}}>*</span></label>
                          <textarea
                            placeholder="Paste your solution code here for AI analysis..."
                            value={solutionCode}
                            onChange={(e) => setSolutionCode(e.target.value)}
                            style={{ minHeight: "150px", resize: "vertical", fontFamily: "monospace" }}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

<div style={{ borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "white", margin: "0" }}>Your Solving Performance Signals</h4>
                  
                  {/* Confidence rating */}
                  <div className="rev-rating-selector">
                    <label className="rev-form-label">Confidence Rating</label>
                    {confidenceLabels.map(lbl => (
                      <div 
                        key={lbl.value} 
                        className={`rev-rating-option ${confidence === lbl.value ? "rev-rating-option-selected" : ""}`}
                        onClick={() => setConfidence(lbl.value)}
                      >
                        <div className="rev-rating-num">{lbl.value}</div>
                        <div>
                          <span className="rev-rating-label">{lbl.name}</span>
                          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", margin: "0" }}>{lbl.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Correctness & Time Taken */}
                  <div className="rev-form-row">
                    <div className="rev-form-group">
                      <label className="rev-form-label">Was your solution correct?</label>
                      <div className="rev-toggle-group">
                        <button
                          type="button"
                          className={`rev-toggle-btn ${correctness ? "rev-toggle-btn-active-yes" : ""}`}
                          onClick={() => setCorrectness(true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`rev-toggle-btn ${!correctness ? "rev-toggle-btn-active-no" : ""}`}
                          onClick={() => setCorrectness(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="rev-form-group">
                      <label className="rev-form-label">Time Taken (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={timeTaken}
                        onChange={(e) => setTimeTaken(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Hints Used & Submission Count */}
                  <div className="rev-form-row">
                    <div className="rev-form-group">
                      <label className="rev-form-label">Hints Used (count)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hintsUsed}
                        onChange={(e) => setHintsUsed(e.target.value)}
                      />
                    </div>

                    <div className="rev-form-group">
                      <label className="rev-form-label">Submission Count</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={submissionCount}
                        onChange={(e) => setSubmissionCount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

              </div>
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-ice)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddLibraryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !addMethod}>
                  {submitting ? "Adding..." : "Add to Revision Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD EXTERNAL PROBLEM MODAL ================= */}
      {showAddExternalModal && (
        <div className="rev-modal-overlay">
          <div className="rev-modal">
            <div className="rev-modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>Add Solved External Problem</h3>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem", borderRadius: "50%" }} onClick={() => setShowAddExternalModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddExternalProblem}>
              <div className="rev-modal-body">
                

                {/* Method Selection Step */}
                {!addMethod && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div 
                      onClick={() => setAddMethod("quick")}
                      style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-ice)", borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-ice)"}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "white" }}>Quick Add</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Fast setup using pattern and personal notes.</p>
                    </div>
                    <div 
                      onClick={() => setAddMethod("solution")}
                      style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-ice)", borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-ice)"}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧠</div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "white" }}>Add With Solution</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Advanced AI analysis using solution code.</p>
                    </div>
                  </div>
                )}

{errorMessage && (
                  <div style={{ padding: "0.6rem 0.85rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--text-danger)", fontSize: "0.75rem", marginBottom: "1rem" }}>
                    {errorMessage}
                  </div>
                )}

                {/* External Info Fields */}
                <div className="rev-form-group">
                  <label className="rev-form-label">Problem Title / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Word Ladder"
                    value={extTitle}
                    onChange={(e) => setExtTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="rev-form-group">
                  <label className="rev-form-label">Problem URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://leetcode.com/problems/word-ladder"
                    value={extUrl}
                    onChange={(e) => setExtUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="rev-form-row">
                  <div className="rev-form-group">
                    <label className="rev-form-label">Difficulty</label>
                    <select value={extDifficulty} onChange={(e) => setExtDifficulty(e.target.value)} style={{ background: "#0a0d14" }}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="rev-form-group">
                    <label className="rev-form-label">Tags / Topics</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {ALL_TOPICS.map(topic => (
                        <span 
                          key={topic}
                          onClick={() => {
                            if (extTags.includes(topic)) {
                              setExtTags(extTags.filter(t => t !== topic));
                            } else {
                              setExtTags([...extTags, topic]);
                            }
                          }}
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: extTags.includes(topic) ? "var(--primary)" : "var(--border-ice)",
                            background: extTags.includes(topic) ? "rgba(99, 102, 241, 0.15)" : "transparent",
                            color: extTags.includes(topic) ? "white" : "var(--text-secondary)",
                            transition: "all 0.2s"
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Signals Form Part */}
                
                {addMethod && (
                  <div style={{ borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "0.85rem", color: "white", margin: "0" }}>
                        {addMethod === "quick" ? "⚡ Quick Add Configuration" : "🧠 Solution Analysis Configuration"}
                      </h4>
                      <button type="button" onClick={() => setAddMethod(null)} className="btn btn-secondary btn-sm" style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}>Change Method</button>
                    </div>

                    {addMethod === "quick" && (
                      <>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Algorithm Pattern Used <span style={{color: "var(--danger)"}}>*</span></label>
                          <input
                            type="text"
                            placeholder="e.g. Sliding Window, BFS, Two Pointers"
                            value={patternUsed}
                            onChange={(e) => setPatternUsed(e.target.value)}
                            required
                          />
                        </div>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Personal Notes (Optional)</label>
                          <textarea
                            placeholder="Add your thought process, approach, or key constraints here..."
                            value={personalNotes}
                            onChange={(e) => setPersonalNotes(e.target.value)}
                            style={{ minHeight: "80px", resize: "vertical" }}
                          />
                        </div>
                      </>
                    )}

                    {addMethod === "solution" && (
                      <>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Programming Language</label>
                          <select value={programmingLanguage} onChange={(e) => setProgrammingLanguage(e.target.value)} style={{ background: "#0a0d14" }}>
                            <option value="Python">Python</option>
                            <option value="C++">C++</option>
                            <option value="Java">Java</option>
                            <option value="JavaScript">JavaScript</option>
                          </select>
                        </div>
                        <div className="rev-form-group">
                          <label className="rev-form-label">Solution Code <span style={{color: "var(--danger)"}}>*</span></label>
                          <textarea
                            placeholder="Paste your solution code here for AI analysis..."
                            value={solutionCode}
                            onChange={(e) => setSolutionCode(e.target.value)}
                            style={{ minHeight: "150px", resize: "vertical", fontFamily: "monospace" }}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

<div style={{ borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "white", margin: "0" }}>Your Solving Performance Signals</h4>
                  
                  {/* Confidence rating */}
                  <div className="rev-rating-selector">
                    <label className="rev-form-label">Confidence Rating</label>
                    {confidenceLabels.map(lbl => (
                      <div 
                        key={lbl.value} 
                        className={`rev-rating-option ${confidence === lbl.value ? "rev-rating-option-selected" : ""}`}
                        onClick={() => setConfidence(lbl.value)}
                      >
                        <div className="rev-rating-num">{lbl.value}</div>
                        <div>
                          <span className="rev-rating-label">{lbl.name}</span>
                          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", margin: "0" }}>{lbl.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Correctness & Time Taken */}
                  <div className="rev-form-row">
                    <div className="rev-form-group">
                      <label className="rev-form-label">Was your solution correct?</label>
                      <div className="rev-toggle-group">
                        <button
                          type="button"
                          className={`rev-toggle-btn ${correctness ? "rev-toggle-btn-active-yes" : ""}`}
                          onClick={() => setCorrectness(true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`rev-toggle-btn ${!correctness ? "rev-toggle-btn-active-no" : ""}`}
                          onClick={() => setCorrectness(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="rev-form-group">
                      <label className="rev-form-label">Time Taken (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={timeTaken}
                        onChange={(e) => setTimeTaken(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Hints Used & Submission Count */}
                  <div className="rev-form-row">
                    <div className="rev-form-group">
                      <label className="rev-form-label">Hints Used (count)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={hintsUsed}
                        onChange={(e) => setHintsUsed(e.target.value)}
                      />
                    </div>

                    <div className="rev-form-group">
                      <label className="rev-form-label">Submission Count</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={submissionCount}
                        onChange={(e) => setSubmissionCount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

              </div>
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-ice)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddExternalModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !addMethod}>
                  {submitting ? "Adding..." : "Add to Revision Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function RevisionHub() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RevisionHubContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default RevisionHub;
