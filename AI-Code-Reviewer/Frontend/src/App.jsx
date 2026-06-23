import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";

// Load additional Prism components for syntax highlighting
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // HTML

const PRESETS = {
  javascript: [
    {
      name: "Closure Memory Leak",
      code: `// Buggy JavaScript Example\nfunction fetchData() {\n  var list = [];\n  for (var i = 0; i < 10000; i++) {\n    list.push(function() {\n      return i; // Closure memory leak & var scope issue\n    });\n  }\n  \n  // Unhandled promise rejection\n  fetch('https://api.example.com/data')\n    .then(res => res.json())\n    .then(data => console.log(data));\n}`
    },
    {
      name: "Callback Hell & Sync Loop",
      code: `// Nested callbacks & slow sync loops\nconst fs = require('fs');\n\nfunction processLogs(dir) {\n  fs.readdir(dir, (err, files) => {\n    if (err) throw err;\n    files.forEach(file => {\n      fs.readFile(dir + '/' + file, 'utf-8', (err, data) => {\n        const lines = data.split('\\n');\n        for(let i=0; i<lines.length; i++) {\n          if(lines[i].includes('ERROR')) {\n             console.log("Found error inside: " + file);\n          }\n        }\n      });\n    });\n  });\n}`
    }
  ],
  python: [
    {
      name: "SQL Injection & Close",
      code: `# Vulnerable to SQL Injection and poor file context\ndef get_user_data(user_id, db):\n    # Vulnerable to SQL Injection via direct f-string formatting\n    query = f"SELECT * FROM users WHERE id = '{user_id}'"\n    cursor = db.execute(query)\n    \n    # Insecure file write without with context manager\n    log_file = open("query_logs.txt", "a")\n    log_file.write(f"Queried user: {user_id}\\n")\n    log_file.close()\n    \n    return cursor.fetchall()`
    },
    {
      name: "Mutable Defaults",
      code: `# Dangerous mutable default arguments & wrong exception handling\ndef append_to_list(element, target_list=[]):\n    target_list.append(element)\n    return target_list\n\ndef divide_numbers(a, b):\n    try:\n        return a / b\n    except:\n        # Bad practice: bare except and return None without warning\n        return None`
    }
  ],
  cpp: [
    {
      name: "Out of Bounds & Leak",
      code: `// Memory leaks and off-by-one out of bounds writes\n#include <iostream>\n\nvoid processNumbers() {\n    int* array = new int[5]; // Allocated dynamically, never freed\n    \n    for (int i = 0; i <= 5; ++i) { // Bug: index 5 is out of bounds for size 5\n        array[i] = i * 100;\n    }\n    \n    std::cout << "Done writing array values" << std::endl;\n}`
    }
  ],
  java: [
    {
      name: "Resource Leak",
      code: `// Resource leak & null handling issues\nimport java.io.*;\n\npublic class ResourceLogger {\n    public void writeLog(String path, String msg) {\n        BufferedWriter writer = null;\n        try {\n            writer = new BufferedWriter(new FileWriter(path, true));\n            writer.write(msg);\n            // writer is never closed in a finally block! Resource leak\n        } catch (IOException e) {\n            e.printStackTrace();\n        }\n    }\n}`
    }
  ],
  css: [
    {
      name: "Fixed Layout & Hardcoding",
      code: `/* Bad practices: fixed pixel layouts, lack of variables, duplicate styles */\n.main-card {\n  width: 400px;\n  height: 500px; /* Bad: height should be flexible */\n  background-color: #ff0000; /* Bad: hardcoded color, use var */\n  margin-left: 20px;\n  float: left; /* Bad: outdated layout mechanism */\n}\n\n.main-card h2 {\n  color: #ff0000; /* Duplicate color */\n  font-size: 24px;\n}`
    }
  ],
  html: [
    {
      name: "Invalid Semantics",
      code: `<!-- Non-semantic structure, missing alt tags, inline styling -->\n<div id="header" style="background: blue; padding: 20px;">\n  <span class="title">My Awesome Code Reviewer</span>\n</div>\n\n<div id="content">\n  <img src="logo.png"> <!-- Missing alt attribute -->\n  <br><br>\n  <a href="javascript:void(0)" onclick="doSomething()">Click Here</a> <!-- Bad link practice -->\n</div>`
    }
  ]
};

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1\n}`);
  const [selectedLang, setSelectedLang] = useState("javascript");
  const [review, setReview] = useState("");
  const [terminalError, setTerminalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loaderStep, setLoaderStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  async function fetchHistory() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/ai/history`
      );
      setHistory(response.data);
      localStorage.setItem("codereview_history", JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to fetch history from database, falling back to localStorage", error);
      try {
        const saved = localStorage.getItem("codereview_history");
        if (saved) setHistory(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    prism.highlightAll();
  }, [code, selectedLang]);

  // Handle active loader step simulations
  useEffect(() => {
    if (!loading) {
      setLoaderStep(0);
      return;
    }
    const t1 = setTimeout(() => setLoaderStep(1), 1000);
    const t2 = setTimeout(() => setLoaderStep(2), 2500);
    const t3 = setTimeout(() => setLoaderStep(3), 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  async function reviewCode() {
    setLoading(true);
    setActiveTab("overview");
    setSelectedHistoryId(null);
    setTerminalError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/ai/get-review`,
        { code, language: selectedLang }
      );
      
      const { review: newReview, error: newError } = response.data;
      setReview(newReview);
      setTerminalError(newError);
      
      if (newError) {
        setActiveTab("terminal");
      }
      
      // Sync history with backend database
      try {
        const historyRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/ai/history`
        );
        const updatedHistory = historyRes.data;
        setHistory(updatedHistory);
        localStorage.setItem("codereview_history", JSON.stringify(updatedHistory));
        if (updatedHistory.length > 0) {
          setSelectedHistoryId(updatedHistory[0].id);
        }
      } catch (historyErr) {
        console.error("Failed to sync history from DB:", historyErr);
        // Fallback local update if DB fetch fails
        const newHistoryItem = {
          id: Date.now().toString(),
          language: selectedLang,
          code,
          review: newReview,
          error: newError,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
        };
        const updatedHistory = [newHistoryItem, ...history.slice(0, 19)];
        setHistory(updatedHistory);
        localStorage.setItem("codereview_history", JSON.stringify(updatedHistory));
        setSelectedHistoryId(newHistoryItem.id);
      }
    } catch {
      setReview("❌ Error fetching review from AI Engine. Please check server logs and try again.");
      setTerminalError(null);
    }
    setLoading(false);
  }

  const loadPreset = (presetCode) => {
    setCode(presetCode);
    setTerminalError(null);
    setSelectedHistoryId(null);
  };

  const loadHistoryItem = (item) => {
    setCode(item.code);
    setSelectedLang(item.language);
    setReview(item.review);
    setTerminalError(item.error || null);
    setSelectedHistoryId(item.id);
    if (item.error) {
      setActiveTab("terminal");
    } else {
      setActiveTab("overview");
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/ai/history`
      );
    } catch (error) {
      console.error("Failed to clear history on backend:", error);
    }
    setHistory([]);
    localStorage.removeItem("codereview_history");
    setSelectedHistoryId(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      setSelectedHistoryId(null);
      const ext = file.name.split(".").pop().toLowerCase();
      const mapping = {
        js: "javascript", jsx: "javascript", ts: "javascript", tsx: "javascript",
        py: "python",
        cpp: "cpp", h: "cpp", cc: "cpp", cxx: "cpp",
        java: "java",
        css: "css",
        html: "html", htm: "html"
      };
      if (mapping[ext]) {
        setSelectedLang(mapping[ext]);
      }
    };
    reader.readAsText(file);
  };

  // Parsing recommendations & quality score
  const parseReviewData = (text) => {
    if (!text) return { score: 100, issues: [], refactoredCode: null };
    if (text.startsWith("❌ Error")) {
      return { score: 0, issues: [{ type: "error", text }], refactoredCode: null };
    }

    let score = 95;
    const issueCount = (text.match(/❌|issue|bug|problem|error|defect|vulnerability/gi) || []).length;
    const warnCount = (text.match(/⚠️|warning|caution/gi) || []).length;
    score -= (issueCount * 9) + (warnCount * 4);
    if (score < 20) score = 20;
    if (score > 100) score = 100;

    const issues = [];
    // Extract bullets from sections containing Issues or ❌
    const issuesMatch = text.match(/(?:Issues|❌\s*Issues|Problems|Weaknesses)([\s\S]*?)(?:✅|Recommendations|💡|Notes|$)/i);
    if (issuesMatch && issuesMatch[1]) {
      const lines = issuesMatch[1].split("\n");
      lines.forEach(line => {
        const tr = line.trim();
        if (tr.startsWith("-") || tr.startsWith("*") || tr.startsWith("❌") || tr.match(/^\d+\./)) {
          const cleanText = tr.replace(/^[-*\d.\s❌]+/, "").trim();
          if (cleanText) {
            let type = "warning";
            const low = cleanText.toLowerCase();
            if (low.includes("leak") || low.includes("security") || low.includes("injection") || low.includes("null") || low.includes("bounds") || low.includes("infinite")) {
              type = "error";
            } else if (low.includes("style") || low.includes("semicolon") || low.includes("rename") || low.includes("comment")) {
              type = "info";
            }
            issues.push({ type, text: cleanText });
          }
        }
      });
    }

    // Default issue if list is empty
    if (issues.length === 0) {
      if (issueCount > 0) {
        issues.push({ type: "warning", text: "Multiple anomalies detected in analysis. View full markdown logs for details." });
      } else {
        issues.push({ type: "success", text: "No major design issues or leaks identified. Keep up the clean work!" });
      }
    }

    // Extract code block for refactored output
    let refactoredCode = null;
    const codeBlockRegex = /```(?:[a-zA-Z0-9+#-]+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push(match[1]);
    }
    if (blocks.length > 0) {
      refactoredCode = blocks[0];
    }

    return { score, issues, refactoredCode };
  };

  const reviewStats = parseReviewData(review);

  // SVG parameters for dashboard visual gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (reviewStats.score / 100) * circumference;
  
  const getScoreColor = (sc) => {
    if (sc >= 80) return "var(--success)";
    if (sc >= 50) return "var(--warning)";
    return "var(--error)";
  };

  // Helper to resolve prism object dynamically
  const getPrismLang = (langId) => {
    switch(langId) {
      case "python": return prism.languages.python;
      case "cpp": return prism.languages.cpp;
      case "java": return prism.languages.java;
      case "css": return prism.languages.css;
      case "html": return prism.languages.markup;
      default: return prism.languages.javascript;
    }
  };

  return (
    <div className="app-container">
      {/* Background glow graphics */}
      <div className="glow-effect"></div>
      <div className="glow-effect-bottom"></div>

      {/* Sidebar Panel */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Reviewify.ai</span>
          </div>
          <button onClick={() => setSidebarCollapsed(true)} className="toggle-sidebar-btn" title="Collapse Sidebar">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Preset section */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">Bug Templates</span>
          <div className="preset-grid">
            {(PRESETS[selectedLang] || []).map((preset, idx) => (
              <button key={idx} onClick={() => loadPreset(preset.code)} className="preset-btn">
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        <div className="sidebar-section" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <span className="sidebar-section-title">Review Logs ({history.length})</span>
          <div className="history-list">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadHistoryItem(item)}
                className={`history-item ${selectedHistoryId === item.id ? "active" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="history-lang">{item.language}</span>
                  <span className="history-date">{item.date}</span>
                </div>
                <span className="history-code">{item.code}</span>
              </button>
            ))}
          </div>
          <button onClick={clearHistory} disabled={history.length === 0} className="clear-history-btn">
            🗑️ Clear History
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="main-workspace">
        <header className="workspace-header">
          <div className="header-left">
            {sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(false)} className="expand-btn" title="Expand Sidebar">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className="header-title-container">
              <h1 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Dashboard</h1>
              <span className="header-subtitle">AI-assisted static vulnerability scanner</span>
            </div>
          </div>
          <div className="header-right">
            <div className="badge-pill">
              <span className="badge-glow"></span>
              <span>Gemini Pro Engaged</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="workspace-content">
          {/* Input Panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <span>📝</span> Source Code
              </div>
              <div className="panel-actions">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="select-lang"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                </select>
                <div className="icon-btn" title="Upload Source File">
                  📁
                  <input type="file" onChange={handleFileUpload} />
                </div>
                <button onClick={() => setCode("")} className="icon-btn" title="Clear Code">
                  ❌
                </button>
              </div>
            </div>

            <div className="editor-body">
              <div className="code-editor-container">
                <Editor
                  value={code}
                  onValueChange={(val) => setCode(val)}
                  highlight={(val) => prism.highlight(val, getPrismLang(selectedLang), selectedLang)}
                  padding={18}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    minHeight: "100%",
                  }}
                />
              </div>
            </div>

            <div className="editor-footer">
              <div className="editor-stats">
                {code.split("\n").length} Lines | {code.length} Characters
              </div>
              <button onClick={reviewCode} disabled={loading || !code.trim()} className="analyze-btn">
                {loading ? (
                  <>
                    <span className="loader-spinner"></span>
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Analyze Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Output Panel */}
          <div className="panel">
            {review && !loading && (
              <div className="tabs-container">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                >
                  📈 Overview
                </button>
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`tab-btn ${activeTab === "issues" ? "active" : ""}`}
                >
                  ⚠️ Issues ({reviewStats.issues.filter(i => i.type !== "success").length})
                </button>
                {terminalError && (
                  <button
                    onClick={() => setActiveTab("terminal")}
                    className={`tab-btn ${activeTab === "terminal" ? "active" : ""}`}
                  >
                    🖥️ Terminal
                  </button>
                )}
                {reviewStats.refactoredCode && (
                  <button
                    onClick={() => setActiveTab("refactored")}
                    className={`tab-btn ${activeTab === "refactored" ? "active" : ""}`}
                  >
                    💻 Refactored
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("markdown")}
                  className={`tab-btn ${activeTab === "markdown" ? "active" : ""}`}
                >
                  📝 Raw Markdown
                </button>
              </div>
            )}

            <div className="review-body">
              {loading ? (
                <div className="loader-overlay">
                  <div className="loader-ring">
                    <div className="loader-ring-outer"></div>
                    <div className="loader-ring-inner"></div>
                    <div className="loader-icon">🤖</div>
                  </div>
                  <h3 className="loader-title">Analyzing Architecture</h3>
                  <div className="loader-steps">
                    <div className={`loader-step ${loaderStep >= 0 ? "completed" : ""} ${loaderStep === 0 ? "active" : ""}`}>
                      <span className="loader-step-dot"></span>
                      <span>Reading input buffer...</span>
                    </div>
                    <div className={`loader-step ${loaderStep >= 1 ? "completed" : ""} ${loaderStep === 1 ? "active" : ""}`}>
                      <span className="loader-step-dot"></span>
                      <span>Querying Gemini Engine...</span>
                    </div>
                    <div className={`loader-step ${loaderStep >= 2 ? "completed" : ""} ${loaderStep === 2 ? "active" : ""}`}>
                      <span className="loader-step-dot"></span>
                      <span>Resolving security issues...</span>
                    </div>
                    <div className={`loader-step ${loaderStep >= 3 ? "completed" : ""} ${loaderStep === 3 ? "active" : ""}`}>
                      <span className="loader-step-dot"></span>
                      <span>Structuring report logs...</span>
                    </div>
                  </div>
                </div>
              ) : review ? (
                <>
                  {/* Tab Content: Overview */}
                  {activeTab === "overview" && (
                    <div className="overview-tab">
                      <div className="overview-grid">
                        <div className="score-circle-container">
                          <svg className="score-svg">
                            <circle className="score-bg-circle" cx="55" cy="55" r={radius} />
                            <circle
                              className="score-progress-circle"
                              cx="55"
                              cy="55"
                              r={radius}
                              stroke={getScoreColor(reviewStats.score)}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                            />
                          </svg>
                          <div className="score-value" style={{ color: getScoreColor(reviewStats.score) }}>
                            <span>{reviewStats.score}</span>
                            <span className="score-label">Score</span>
                          </div>
                        </div>
                        <div className="overview-metrics-summary">
                          <span className="overview-status-title">
                            {reviewStats.score >= 80 ? "Healthy Code Base" : reviewStats.score >= 50 ? "Refactoring Advised" : "Critical Fixes Required"}
                          </span>
                          <p className="overview-status-desc">
                            The analysis scanned code structures for compliance, resource allocations, and syntax flaws. Look inside the Issues tab for items requiring correction.
                          </p>
                        </div>
                      </div>

                      <div className="severity-counts">
                        <div className="severity-card error">
                          <span className="severity-card-num">
                            {reviewStats.issues.filter((i) => i.type === "error").length}
                          </span>
                          <span className="severity-card-label">Critical</span>
                        </div>
                        <div className="severity-card warning">
                          <span className="severity-card-num">
                            {reviewStats.issues.filter((i) => i.type === "warning").length}
                          </span>
                          <span className="severity-card-label">Warnings</span>
                        </div>
                        <div className="severity-card success">
                          <span className="severity-card-num">
                            {reviewStats.issues.filter((i) => i.type === "success" || i.type === "info").length}
                          </span>
                          <span className="severity-card-label">Info / Safe</span>
                        </div>
                      </div>

                      <div className="highlights-card">
                        <span className="highlights-title">Scanned Feedback</span>
                        <ul className="highlights-list">
                          {reviewStats.issues.slice(0, 4).map((issue, idx) => (
                            <li key={idx} className="highlight-item">
                              <span className="highlight-bullet">
                                {issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "✔️"}
                              </span>
                              <span>{issue.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Issues List */}
                  {activeTab === "issues" && (
                    <div className="issues-tab">
                      {reviewStats.issues.map((issue, idx) => (
                        <div key={idx} className={`issue-item-card ${issue.type} expanded`}>
                          <div className="issue-item-header">
                            <div className="issue-item-title-row">
                              <span className={`issue-type-badge ${issue.type}`}>{issue.type}</span>
                              <span className="issue-title">{issue.text.split(":")[0]}</span>
                            </div>
                          </div>
                          <div className="issue-item-body">
                            <p>{issue.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab Content: Refactored Code */}
                  {activeTab === "refactored" && reviewStats.refactoredCode && (
                    <div className="refactored-tab">
                      <div className="refactored-actions">
                        <span className="refactored-desc">AI generated optimization suggestion:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(reviewStats.refactoredCode);
                            alert("Code copied to clipboard!");
                          }}
                          className="analyze-btn"
                          style={{ padding: "0.4rem 1rem", fontSize: "0.75rem" }}
                        >
                          📋 Copy Code
                        </button>
                      </div>
                      <div className="refactored-editor-container">
                        <pre className={`language-${selectedLang}`} style={{ margin: 0, background: 'transparent' }}>
                          <code dangerouslySetInnerHTML={{
                            __html: prism.highlight(
                              reviewStats.refactoredCode,
                              getPrismLang(selectedLang),
                              selectedLang
                            )
                          }} />
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Terminal Error */}
                  {activeTab === "terminal" && terminalError && (
                    <div className="terminal-container">
                      <div className="terminal-header">
                        <div className="terminal-tabs">
                          <div className="terminal-tab-item active">Terminal</div>
                          <div className="terminal-tab-item">Problems</div>
                          <div className="terminal-tab-item">Output</div>
                          <div className="terminal-tab-item">Debug Console</div>
                        </div>
                        <div className="terminal-actions-right">
                          <button className="terminal-action-btn" onClick={() => setTerminalError(null)} title="Clear Terminal">
                            🗑️
                          </button>
                          <button className="terminal-action-btn" title="Split Terminal">
                            🥞
                          </button>
                          <button className="terminal-action-btn" onClick={() => setActiveTab("overview")} title="Close Terminal">
                            ✖
                          </button>
                        </div>
                      </div>
                      <div className="terminal-body">
                        <div className="terminal-error-text">
                          {terminalError}
                        </div>
                        <span className="terminal-cursor"></span>
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Raw Markdown */}
                  {activeTab === "markdown" && (
                    <div className="markdown-body">
                      <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-placeholder">
                  <div className="placeholder-icon-container">💡</div>
                  <h3 className="placeholder-title">No Active Scan</h3>
                  <p className="placeholder-text">
                    Select a preset template or upload your script, then click "Analyze Code" to initiate Gemini compilation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
