import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`);

  const [review, setReview] = useState(``);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/ai/get-review`,
        { code }
      );
      setReview(response.data);
    } catch (error) {
      setReview("❌ Error fetching review. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo-icon">✨</span>
            CodeReview AI
          </h1>
          <p className="app-subtitle">Get instant AI-powered code reviews</p>
        </div>
      </header>

      <main className="main-content">
        <div className="panels-container">
          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="panel-header">
              <h2>Your Code</h2>
              <div className="language-badge">JavaScript</div>
            </div>
            <div className="code-editor-container">
              <Editor
                value={code}
                onValueChange={(code) => setCode(code)}
                highlight={(code) =>
                  prism.highlight(
                    code,
                    prism.languages.javascript,
                    "javascript"
                  )
                }
                padding={16}
                style={{
                  fontFamily:
                    '"Fira Code", "Monaco", "Cascadia Code", monospace',
                  fontSize: 14,
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>
            <button
              onClick={reviewCode}
              className={`review-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-loader"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Review Code
                </>
              )}
            </button>
          </div>

          {/* Review Panel */}
          <div className="review-panel">
            <div className="panel-header">
              <h2>AI Review</h2>
              <div className="ai-badge">Powered by AI</div>
            </div>
            <div className="review-content">
              {review ? (
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              ) : (
                <div className="review-placeholder">
                  <div className="placeholder-icon">💡</div>
                  <h3>Your AI review will appear here</h3>
                  <p>Click the "Review Code" button to analyze your code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer>
        <p className="footer-text">
          &copy; 2024 CodeReview AI. Built with ❤️ using React and OpenAI API By{" "}
          <br />
          <i>noumanahmed.cs@gmail.com</i>
        </p>
      </footer>
    </div>
  );
}

export default App;
