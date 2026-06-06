import re

file_path = "C:/Users/shash/OneDrive/Desktop/Project3/AlgoMentor/src/app/revision/page.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the new Strategy Selector JSX
strategy_selector_jsx = """
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
"""

# Define the new Method specific fields for both forms
method_fields_jsx = """
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
"""

tags_jsx = """
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
"""

# Regex replacements to inject the strategy selector and fields
library_modal_pattern = re.compile(r'({/\* ================= ADD FROM LIBRARY MODAL ================= \*/}.*?<form onSubmit={handleAddLibraryProblem}>\s*<div className="rev-modal-body">.*?)(?=<!-- Error Message -->|{errorMessage)', re.DOTALL)

def inject_library(match):
    return match.group(1) + "\n" + strategy_selector_jsx + "\n"

content = re.sub(library_modal_pattern, inject_library, content)

# For external problem tags:
external_tags_pattern = re.compile(r'<div className="rev-form-group">\s*<label className="rev-form-label">Tags \(comma separated\)</label>\s*<input[^>]+/>\s*</div>', re.DOTALL)
content = re.sub(external_tags_pattern, tags_jsx, content)

# Inject the method fields right above Performance Signals
perf_signal_pattern = re.compile(r'(<div style={{ borderTop: "1px solid var\(--border-ice\)", paddingTop: "1rem", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>\s*<h4 style={{ fontSize: "0.85rem", color: "white", margin: "0" }}>Your Solving Performance Signals</h4>)')
content = re.sub(perf_signal_pattern, lambda m: method_fields_jsx + "\n" + m.group(1), content)

# Inject Strategy Selector into External Modal
external_modal_pattern = re.compile(r'({/\* ================= ADD EXTERNAL PROBLEM MODAL ================= \*/}.*?<form onSubmit={handleAddExternalProblem}>\s*<div className="rev-modal-body">.*?)(?=<!-- Error Message -->|{errorMessage)', re.DOTALL)
def inject_external(match):
    return match.group(1) + "\n" + strategy_selector_jsx + "\n"
content = re.sub(external_modal_pattern, inject_external, content)

# Update submit button states to only enable if addMethod is selected
button_pattern = re.compile(r'<button type="submit" className="btn btn-primary" disabled={submitting}>')
content = re.sub(button_pattern, r'<button type="submit" className="btn btn-primary" disabled={submitting || !addMethod}>', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modals patched successfully.")
