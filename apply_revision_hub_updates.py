import re
import os

file_path = "C:/Users/shash/OneDrive/Desktop/Project3/AlgoMentor/src/app/revision/page.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove state variables for AI generation
content = re.sub(
    r'\s*// AI Generation States\s*const \[addMethod, setAddMethod\] = useState\(null\); // \'quick\' \| \'solution\' \| null\s*const \[patternUsed, setPatternUsed\] = useState\(""\);\s*const \[personalNotes, setPersonalNotes\] = useState\(""\);\s*const \[programmingLanguage, setProgrammingLanguage\] = useState\("Python"\);\s*const \[solutionCode, setSolutionCode\] = useState\(""\);\s*',
    '\n  // Rate Review Modal State\n  const [showRateModal, setShowRateModal] = useState(false);\n  const [rateItemId, setRateItemId] = useState(null);\n  const [rateConfidence, setRateConfidence] = useState(3);\n  const [rateTimeTaken, setRateTimeTaken] = useState(20);\n  const [rateHintsUsed, setRateHintsUsed] = useState(0);\n',
    content
)

# 2. Update resetForm
content = re.sub(
    r'setExtTags\(\[\]\);\s*setAddMethod\(null\);\s*setPatternUsed\(""\);\s*setPersonalNotes\(""\);\s*setProgrammingLanguage\("Python"\);\s*setSolutionCode\(""\);\s*setErrorMessage\(""\);',
    'setExtTags([]);\n    setErrorMessage("");',
    content
)

# 3. Update handleAddLibraryProblem payload
content = re.sub(
    r'submissionCount: Number\(submissionCount\),\s*generationStrategy: addMethod,\s*personalNotes: addMethod === "quick" \? personalNotes : "",\s*programmingLanguage: addMethod === "solution" \? programmingLanguage : "",\s*solutionCode: addMethod === "solution" \? solutionCode : ""',
    'submissionCount: Number(submissionCount)',
    content
)

# 4. Update handleAddExternalProblem payload
content = re.sub(
    r'submissionCount: Number\(submissionCount\),\s*generationStrategy: addMethod,\s*personalNotes: addMethod === "quick" \? personalNotes : "",\s*programmingLanguage: addMethod === "solution" \? programmingLanguage : "",\s*solutionCode: addMethod === "solution" \? solutionCode : ""',
    'submissionCount: Number(submissionCount)',
    content
)

# Remove `pattern: addMethod === "quick" ? patternUsed : "",` from both
content = re.sub(r'pattern: addMethod === "quick" \? patternUsed : "",\s*', '', content)

# 5. Add handleRateReview function right before handleDeleteItem
handle_rate = """
  const handleRateReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let recall = "Partially";
      if (rateConfidence >= 4) recall = "Yes";
      else if (rateConfidence <= 2) recall = "No";

      const res = await fetch("/api/revision", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rateItemId,
          recall,
          confidence: rateConfidence,
          timeTaken: Number(rateTimeTaken),
          hintsUsed: Number(rateHintsUsed),
        })
      });
      if (res.ok) {
        setShowRateModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
"""
content = content.replace("  // Delete problem handler", handle_rate + "\n  // Delete problem handler")

# 6. Update Header Row to include Topic Wise Analysis
topic_btn = """
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => router.push("/revision/analytics")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <BarChart2 size={14} />
            <span>Topic wise analysis</span>
          </button>
"""
content = content.replace("        <div className=\"rev-action-buttons\">", "        <div className=\"rev-action-buttons\">\n" + topic_btn)

# 7. Remove Strength Readiness Dashboard
dashboard_start = content.find("{/* Right Column: Strength Readiness Dashboard */}")
dashboard_end = content.find("      {/* ================= ADD FROM LIBRARY MODAL ================= */}")

# Make sure grid-2 becomes just a single column or adjust styles.
# Let's just remove the dashboard part.
if dashboard_start != -1 and dashboard_end != -1:
    content = content[:dashboard_start] + "      </div>\n\n" + content[dashboard_end:]

# Fix the closing div for grid-2 that was removed
content = content.replace("      </div>\n\n      {/* ================= ADD FROM LIBRARY MODAL", "      {/* ================= ADD FROM LIBRARY MODAL")

# 8. Modify Due List item buttons
due_buttons = """
                  <div style={{ display: "flex", gap: "6px" }}>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.35rem 0.5rem", borderRadius: "8px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <ExternalLink size={12} /> Open Solution
                    </a>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setRateItemId(item._id);
                        setRateConfidence(item.confidence || 3);
                        setRateTimeTaken(item.timeTaken || 20);
                        setRateHintsUsed(item.hintsUsed || 0);
                        setShowRateModal(true);
                      }}
                      style={{ padding: "0.35rem 0.5rem", borderRadius: "8px", fontSize: "0.7rem" }}
                    >
                      Rate your review
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const prompt = "analyse tc, analyse pattern from code, analyse topic , imporvements in code, commonh mistakes while writing this code";
                        router.push(`/mentor?initialPrompt=${encodeURIComponent(prompt)}`);
                      }}
                      style={{ padding: "0.35rem 0.5rem", borderRadius: "8px", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Sparkles size={12} /> Get AI Summary
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteItem(item._id)}
                      style={{ padding: "0.35rem", borderRadius: "8px" }}
                      title="Remove from Revision Hub"
                    >
                      <X size={14} />
                    </button>
                  </div>
"""

# Replace the existing div containing the delete button
old_due_buttons = r'<div style={{ display: "flex", gap: "6px" }}>\s*<button\s*className="btn btn-danger btn-sm"\s*onClick=\{\(\) => handleDeleteItem\(item\._id\)\}\s*style=\{\{ padding: "0\.35rem", borderRadius: "8px" \}\}\s*title="Remove from Revision Hub"\s*>\s*<X size=\{14\} />\s*</button>\s*</div>'
content = re.sub(old_due_buttons, due_buttons.strip(), content)

# 9. Remove Method Selection Step and Method Specific Fields from both modals
method_selection_pattern = r'\{\/\* Method Selection Step \*\/\}[\s\S]*?\{\/\* Library Problem Selector \*\/\}'
content = re.sub(method_selection_pattern, '{/* Library Problem Selector */}', content)

method_selection_ext_pattern = r'\{\/\* Method Selection Step \*\/\}[\s\S]*?\{\/\* External Info Fields \*\/\}'
content = re.sub(method_selection_ext_pattern, '{/* External Info Fields */}', content)

method_fields_pattern = r'\{addMethod && \([\s\S]*?<\/div>\s*\)\}'
content = re.sub(method_fields_pattern, '', content)

# Update disabled state
content = content.replace("disabled={submitting || !addMethod}", "disabled={submitting}")

# 10. Add Rate Review Modal
rate_modal = """
      {/* ================= RATE REVIEW MODAL ================= */}
      {showRateModal && (
        <div className="rev-modal-overlay">
          <div className="rev-modal" style={{ maxWidth: "400px" }}>
            <div className="rev-modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>Rate Your Review</h3>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem", borderRadius: "50%" }} onClick={() => setShowRateModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRateReview}>
              <div className="rev-modal-body">
                <div className="rev-rating-selector" style={{ marginBottom: "1rem" }}>
                  <label className="rev-form-label">Confidence Rating</label>
                  {confidenceLabels.map(lbl => (
                    <div 
                      key={lbl.value} 
                      className={`rev-rating-option ${rateConfidence === lbl.value ? "rev-rating-option-selected" : ""}`}
                      onClick={() => setRateConfidence(lbl.value)}
                    >
                      <div className="rev-rating-num">{lbl.value}</div>
                      <div>
                        <span className="rev-rating-label">{lbl.name}</span>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", margin: "0" }}>{lbl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rev-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="rev-form-label">Time Taken (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={rateTimeTaken}
                    onChange={(e) => setRateTimeTaken(e.target.value)}
                  />
                </div>

                <div className="rev-form-group">
                  <label className="rev-form-label">Hints Used (count)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={rateHintsUsed}
                    onChange={(e) => setRateHintsUsed(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-ice)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""
content = content.replace("    </div>\n  );\n}", rate_modal + "\n    </div>\n  );\n}")

# Change grid-2 to grid-1 since right column is removed
content = content.replace('className="grid-2"', 'className="grid-1"')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Revision Hub updated successfully.")
