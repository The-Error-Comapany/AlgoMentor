"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ChevronLeft, Award, RefreshCw, Eye, BookOpen, 
  HelpCircle, ExternalLink, Sliders, ChevronDown, ChevronUp, X
} from "lucide-react";
import { fetchRevisionItems, updateRevisionReview } from "@/services/revisionService";
import "../Revision.css";

function ReviewSessionContent() {
  const router = useRouter();

  // Session state
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Level 1 Answer visibility toggles
  const [showAns1, setShowAns1] = useState(false);
  const [showAns2, setShowAns2] = useState(false);
  const [showAns3, setShowAns3] = useState(false);

  // Optional: re-solve statistics form (revealed if user selects Partially or No and wants to record code execution data)
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [selectedRecallQuality, setSelectedRecallQuality] = useState(""); // "Yes" | "Partially" | "No"
  const [submittingStats, setSubmittingStats] = useState(false);

  // Solve-again signals state
  const [confidence, setConfidence] = useState(3);
  const [correctness, setCorrectness] = useState(true);
  const [timeTaken, setTimeTaken] = useState(25);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Load due queue on mount
  useEffect(() => {
    const loadQueue = async () => {
      setLoading(true);
      try {
        const res = await fetchRevisionItems();
        if (res.success) {
          setQueue(res.dueToday || []);
        }
      } catch (err) {
        console.error("Failed to load review queue", err);
      } finally {
        setLoading(false);
      }
    };
    loadQueue();
  }, []);

  // Compute memory decay level based on days since last review
  const getReviewLevel = (lastReviewDate) => {
    if (!lastReviewDate) return 4; // Fallback to full card
    const now = new Date();
    const last = new Date(lastReviewDate);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return 1;
    if (diffDays <= 14) return 2;
    if (diffDays <= 45) return 3;
    return 4;
  };

  // Reset toggles when card changes
  const resetCardState = () => {
    setIsFlipped(false);
    setShowAns1(false);
    setShowAns2(false);
    setShowAns3(false);
    setShowStatsForm(false);
    setSelectedRecallQuality("");
    setConfidence(3);
    setCorrectness(true);
    setTimeTaken(25);
    setHintsUsed(0);
  };

  // Handle logging standard recall update
  const handleRecallAction = async (quality) => {
    const activeItem = queue[currentIndex];
    if (!activeItem) return;

    // If partially or no, show form to optionally log updated solving stats
    if (quality !== "Yes") {
      setSelectedRecallQuality(quality);
      setShowStatsForm(true);
      return;
    }

    // Direct submission for YES
    setLoading(true);
    try {
      const payload = {
        id: activeItem._id,
        recall: "Yes"
      };

      const res = await updateRevisionReview(payload);
      if (res.success) {
        setCompletedCount(c => c + 1);
        goToNext();
      }
    } catch (err) {
      console.error("Failed to save review", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit complete solve-again stats
  const handleStatsFormSubmit = async (e) => {
    e.preventDefault();
    const activeItem = queue[currentIndex];
    if (!activeItem || !selectedRecallQuality) return;

    setSubmittingStats(true);
    try {
      const payload = {
        id: activeItem._id,
        recall: selectedRecallQuality,
        confidence,
        correctness,
        timeTaken: Number(timeTaken),
        hintsUsed: Number(hintsUsed)
      };

      const res = await updateRevisionReview(payload);
      if (res.success) {
        setCompletedCount(c => c + 1);
        goToNext();
      }
    } catch (err) {
      console.error("Failed to submit updated solving stats", err);
    } finally {
      setSubmittingStats(false);
    }
  };

  // Navigation handlers
  const goToNext = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(prev => prev + 1);
      resetCardState();
    } else {
      setSessionCompleted(true);
    }
  };

  const skipItem = () => {
    goToNext();
  };

  if (loading && queue.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <RefreshCw size={24} className="pulse-yellow" style={{ animation: "spin 2s linear infinite" }} />
        <span style={{ marginLeft: "10px" }}>Loading Spaced-Repetition Queue...</span>
      </div>
    );
  }

  // Handle empty queue on launch
  if (queue.length === 0) {
    return (
      <div className="glass-card" style={{ maxWidth: "500px", margin: "4rem auto", textAlign: "center", padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Award size={48} style={{ color: "var(--text-success)", alignSelf: "center" }} />
        <h3>Review Queue Complete</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          No cards due for revision today! Return to the Dashboard to add solved problems.
        </p>
        <button className="btn btn-primary" onClick={() => router.push("/revision")}>
          Return to Revision Hub
        </button>
      </div>
    );
  }

  // Handle finished session
  if (sessionCompleted) {
    return (
      <div className="glass-card" style={{ maxWidth: "500px", margin: "4rem auto", textAlign: "center", padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Award size={48} style={{ color: "var(--warning)", alignSelf: "center" }} />
        <h3>Session Completed!</h3>
        <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "white" }}>
          You revised {completedCount} problem{completedCount !== 1 ? "s" : ""} today.
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          Memory pathways refreshed! Your spaced intervals have been updated in the database.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={() => router.push("/revision")}>
            Revision Hub
          </button>
          <button className="btn btn-primary" onClick={() => router.push("/problems")}>
            Solve More
          </button>
        </div>
      </div>
    );
  }

  const activeItem = queue[currentIndex];
  const revLevel = getReviewLevel(activeItem.lastReviewDate);
  const card = activeItem.knowledgeCard || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      
      {/* Session Progress Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "750px", width: "100%", margin: "0 auto" }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => router.push("/revision")}
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <ChevronLeft size={16} />
          <span>Exit Session</span>
        </button>
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
          Problem {currentIndex + 1} of {queue.length}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={skipItem}>
          Skip
        </button>
      </div>

      {/* Spaced repetition card */}
      <div className="rev-session-wrapper">
        <div className={`rev-card-inner ${isFlipped ? "rev-card-flipped" : ""}`}>
          
          {/* Card Front: Recall Challenge */}
          <div className="rev-card-front">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <span className={`badge ${
                activeItem.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"
              }`}>
                {activeItem.platform}
              </span>
              <span className={`badge ${
                activeItem.difficulty === "Easy" ? "badge-easy" : activeItem.difficulty === "Hard" ? "badge-hard" : "badge-medium"
              }`}>
                {activeItem.difficulty}
              </span>
            </div>

            <h2 style={{ fontSize: "1.6rem", margin: "1rem 0 0.5rem" }}>{activeItem.title}</h2>
            
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
              Memory Decay: Level {revLevel} Review ({revLevel === 1 ? "1-3 days" : revLevel === 2 ? "4-14 days" : revLevel === 3 ? "15-45 days" : "45+ days"})
            </p>

            <div style={{ borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <Eye size={16} />
                <span>Recall challenge level: {revLevel}</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Close your eyes and try to recall the solution pattern, complexity, and common bugs before revealing.
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setIsFlipped(true)}
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                Reveal AI Revision Card
              </button>
            </div>
          </div>

          {/* Card Back: AI Summary & Tiers */}
          <div className="rev-card-back">
            <div style={{ overflowY: "auto", flexGrow: 1, paddingRight: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--primary-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <BookOpen size={12} />
                  AI Summary Level {revLevel}
                </span>
                <a href={activeItem.url} target="_blank" rel="noreferrer" className="badge badge-easy" style={{ textDecoration: "none", display: "inline-flex", gap: "4px", textTransform: "none" }}>
                  <span>Open URL</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* LEVEL 1: Quick Recall (1-3 Days) */}
              {revLevel === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Pattern</span>
                    <h4 style={{ fontSize: "0.95rem", margin: "0", color: "white" }}>{card.pattern || activeItem.pattern || "N/A"}</h4>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Complexity</span>
                    <p style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>
                      Time: {card.timeComplexity || "O(N)"} | Space: {card.spaceComplexity || "O(1)"}
                    </p>
                  </div>

                  <div style={{ marginTop: "0.5rem", borderTop: "1px solid var(--border-ice)", paddingTop: "0.5rem" }}>
                    <h5 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", margin: "0 0 6px" }}>
                      Quick Recall Questions
                    </h5>
                    
                    <div className="rev-recall-item">
                      <span style={{ fontSize: "0.8rem", color: "white" }}>1. What is the DP state definition or key structure?</span>
                      {showAns1 ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-success)", margin: "4px 0 0" }}>{card.stateDefinition || "Check URL logic"}</p>
                      ) : (
                        <button className="btn btn-secondary btn-sm rev-reveal-answer-btn" onClick={() => setShowAns1(true)}>Reveal Answer</button>
                      )}
                    </div>

                    <div className="rev-recall-item">
                      <span style={{ fontSize: "0.8rem", color: "white" }}>2. What is the transition formula or core lookup logic?</span>
                      {showAns2 ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-success)", margin: "4px 0 0" }}>{card.transitionLogic || "Check URL logic"}</p>
                      ) : (
                        <button className="btn btn-secondary btn-sm rev-reveal-answer-btn" onClick={() => setShowAns2(true)}>Reveal Answer</button>
                      )}
                    </div>

                    <div className="rev-recall-item">
                      <span style={{ fontSize: "0.8rem", color: "white" }}>3. What are common mistakes in this problem?</span>
                      {showAns3 ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-success)", margin: "4px 0 0" }}>{card.commonMistakes || "Check URL logic"}</p>
                      ) : (
                        <button className="btn btn-secondary btn-sm rev-reveal-answer-btn" onClick={() => setShowAns3(true)}>Reveal Answer</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* LEVEL 2: Concept Refresh (4-14 Days) */}
              {revLevel === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Pattern</span>
                    <h4 style={{ fontSize: "0.95rem", margin: "0", color: "white" }}>{card.pattern || activeItem.pattern || "N/A"}</h4>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Core Idea</span>
                    <p style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>{card.coreIdea || "Refer to problem link"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>State / Structure</span>
                    <p style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>{card.stateDefinition || "Refer to problem link"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Complexity</span>
                    <p style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>
                      Time: {card.timeComplexity || "O(N)"} | Space: {card.spaceComplexity || "O(1)"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Common Mistake</span>
                    <p style={{ fontSize: "0.85rem", margin: "0", color: "var(--text-danger)" }}>{card.commonMistakes || "Check base cases"}</p>
                  </div>
                </div>
              )}

              {/* LEVEL 3: Deep Recall (15-45 Days) */}
              {revLevel === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="rev-form-row">
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Pattern</span>
                      <h4 style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>{card.pattern || activeItem.pattern || "N/A"}</h4>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Complexity</span>
                      <p style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>T: {card.timeComplexity} | S: {card.spaceComplexity}</p>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Core Idea</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "white" }}>{card.coreIdea}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>State Definition</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-success)" }}>{card.stateDefinition}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Transition Logic</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-success)" }}>{card.transitionLogic}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Common Mistakes</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-danger)" }}>{card.commonMistakes}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Interview Insight</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-warning)" }}>{card.interviewInsights}</p>
                  </div>
                </div>
              )}

              {/* LEVEL 4: Memory Reconstruction (45+ Days) */}
              {revLevel === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="rev-form-row">
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Pattern</span>
                      <h4 style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>{card.pattern || activeItem.pattern || "N/A"}</h4>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Complexity</span>
                      <p style={{ fontSize: "0.85rem", margin: "0", color: "white" }}>T: {card.timeComplexity} | S: {card.spaceComplexity}</p>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Core Idea</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "white" }}>{card.coreIdea}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>State / Structure</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-success)" }}>{card.stateDefinition}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Transition Logic</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-success)" }}>{card.transitionLogic}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Common Mistakes</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-danger)" }}>{card.commonMistakes}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Interview Insight</span>
                    <p style={{ fontSize: "0.8rem", margin: "0", color: "var(--text-warning)" }}>{card.interviewInsights}</p>
                  </div>
                  {card.relatedProblems && card.relatedProblems.length > 0 && (
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Related Problems</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                        {card.relatedProblems.map((rp) => (
                          <span key={rp} style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.4rem", borderRadius: "4px", color: "var(--text-secondary)" }}>
                            {rp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Back Side Controls */}
            <div style={{ borderTop: "1px solid var(--border-ice)", paddingTop: "1rem", marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: "600", color: "white", marginBottom: "0.25rem" }}>
                Did you recall this problem?
              </div>
              <div className="rev-session-controls" style={{ margin: "0" }}>
                <button type="button" className="btn rev-btn-recall-no" onClick={() => handleRecallAction("No")}>
                  No
                </button>
                <button type="button" className="btn rev-btn-recall-part" onClick={() => handleRecallAction("Partially")}>
                  Partially
                </button>
                <button type="button" className="btn rev-btn-recall-yes" onClick={() => handleRecallAction("Yes")}>
                  Yes
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ================= OPTIONAL RE-SOLVED PERFORMANCE SIGNALS FORM ================= */}
      {showStatsForm && (
        <div className="rev-modal-overlay">
          <div className="rev-modal">
            <div className="rev-modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>Log Re-Solve Performance Metrics</h3>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem", borderRadius: "50%" }} onClick={() => setShowStatsForm(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleStatsFormSubmit}>
              <div className="rev-modal-body">
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Since you recalled this problem <strong style={{ color: "var(--text-warning)" }}>{selectedRecallQuality}</strong>, we recommend solving it again on the external platform. Tell the engine about your execution stats:
                </p>

                {/* Confidence rating */}
                <div className="rev-rating-selector" style={{ marginBottom: "1rem" }}>
                  <label className="rev-form-label">Confidence Rating</label>
                  {[
                    { value: 1, name: "No Idea" },
                    { value: 2, name: "Vague Recall" },
                    { value: 3, name: "Moderate Recall" },
                    { value: 4, name: "Good Recall" },
                    { value: 5, name: "Mastered" }
                  ].map(lbl => (
                    <div 
                      key={lbl.value} 
                      className={`rev-rating-option ${confidence === lbl.value ? "rev-rating-option-selected" : ""}`}
                      onClick={() => setConfidence(lbl.value)}
                      style={{ padding: "0.4rem 0.75rem" }}
                    >
                      <div className="rev-rating-num" style={{ width: "20px", height: "20px", fontSize: "0.75rem" }}>{lbl.value}</div>
                      <span className="rev-rating-label" style={{ fontSize: "0.75rem" }}>{lbl.name}</span>
                    </div>
                  ))}
                </div>

                <div className="rev-form-row">
                  <div className="rev-form-group">
                    <label className="rev-form-label">Solution Correct?</label>
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

                <div className="rev-form-group">
                  <label className="rev-form-label">Hints Used</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={hintsUsed}
                    onChange={(e) => setHintsUsed(e.target.value)}
                  />
                </div>

              </div>
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-ice)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => handleRecallAction("Yes") /* fallback bypass */}>
                  Skip Logging Stats
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingStats}>
                  {submittingStats ? "Submitting..." : "Update Engine & Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function ReviewSession() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReviewSessionContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default ReviewSession;
