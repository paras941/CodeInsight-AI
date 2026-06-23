# ⚡ Reviewify.ai — AI-Powered Code Reviewer & Vulnerability Scanner

Reviewify.ai is an advanced, interactive, and premium web application designed to perform static vulnerability scanning and code reviews on the fly. Built with **React (Vite)**, **Node.js (Express)**, **MongoDB**, and powered by the **Google Gemini API**, it provides developers with real-time feedback, code quality metrics, syntax checking, and AI-driven optimization suggestions.

---

## 🎨 Features & Capabilities

- **🔍 Real-Time Code Editor:** A fully integrated editor using `react-simple-code-editor` and `prismjs` supporting syntax highlighting for multiple languages:
  - JavaScript, Python, C++, Java, CSS, and HTML.
- **🤖 Deep AI Review Engine:** Powered by Google Gemini (`gemini-2.5-flash` by default), analyzing code structure, security risks (like SQL Injection), memory management, and overall design patterns.
- **📈 Dynamic Quality Dashboard:**
  - **Quality Score Gauge:** A beautiful SVG-based circular indicator presenting an automated score based on findings.
  - **Issues Tab:** Highlights and categorizes scanned issues by severity (Critical ❌, Warnings ⚠️, Info/Safe ✔️).
  - **Refactored Code:** Clean tab rendering optimized code suggestions with copy-to-clipboard access.
  - **Raw Markdown:** Rich-text display of the full explanation from the AI reviewer.
- **🖥️ Simulated VS Code Terminal:** Programmatic syntax error catcher (using a Node.js sandbox VM for JavaScript) and AI-simulated compiler output displayed in a classic dark terminal console.
- **📁 File Upload Support:** Directly drag-and-drop or select scripts to import code, auto-detecting language formats.
- **📚 Interactive Templates & Presets:** Loaded template bugs (e.g., Memory Leaks, Callback Hell, SQL Injection, Mutable Defaults, Out of Bounds, Resource Leaks) for immediate testing.
- **💾 Review History & Logs:** Integrated review logs stored in a MongoDB database with a LocalStorage fallback to allow users to revisit, toggle, or clear past reviews.

---

## 📂 Project Architecture

```
Ai-code-reviwer/
├── AI-Code-Reviewer/
│   ├── Backend/                 # Express.js Server
│   │   ├── src/
│   │   │   ├── controller/      # API Controllers (Review request, History management)
│   │   │   ├── services/        # AI Integration (Gemini SDK Configuration & Prompts)
│   │   │   ├── routes/          # Express Routers
│   │   │   ├── app.js           # Server application configuration
│   │   │   └── db.js            # MongoDB client connector
│   │   ├── server.js            # Server entry point
│   │   ├── vercel.json          # Deployment configuration for Vercel
│   │   └── .env.example
│   │
│   └── Frontend/                # Vite + React Dashboard
│       ├── src/
│       │   ├── assets/
│       │   ├── App.jsx          # Dashboard Layout & Core Application Logic
│       │   ├── App.css          # Dark Mode & Glassmorphic Custom Styling
│       │   ├── index.css
│       │   └── main.jsx
│       ├── index.html           # Main HTML shell
│       ├── vite.config.js       # Vite build configurations
│       ├── vercel.json          # Vercel SPA routing rules
│       └── .env.example
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Editor:** React Simple Code Editor
- **Syntax Highlighting:** Prism.js & rehype-highlight (highlight.js styles)
- **HTTP Client:** Axios
- **Markdown Renderer:** React Markdown

### Backend
- **Framework:** Node.js (Express.js)
- **AI Core:** Google Generative AI SDK (`@google/generative-ai`)
- **Database:** MongoDB
- **Security & Sandbox:** Node.js Native VM module (script verification)
- **CORS & Environment:** cors, dotenv

---

## 🚀 Getting Started

### 1️⃣ Clone and Prepare the Workspace

```bash
git clone https://github.com/NoumanAhmed01/AI-Code-Reviewer.git
cd AI-Code-Reviewer/AI-Code-Reviewer
```

### 2️⃣ Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_GEMINI_KEY=your_google_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Run the backend server in development mode:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`.

### 3️⃣ Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Run the frontend development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🌍 Deployment

Both components are pre-configured with `vercel.json` files for instant deployments on **Vercel**.

### Backend Deployment
Deploy the `Backend/` subdirectory to Vercel, Render, or Railway. Ensure you add the environment variables:
- `MONGODB_URI`
- `GOOGLE_GEMINI_KEY`
- `GEMINI_MODEL`

### Frontend Deployment
Deploy the `Frontend/` subdirectory to Vercel or Netlify. Configure the build settings to use:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL` pointing to your deployed backend URL.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ using Gemini & React.
