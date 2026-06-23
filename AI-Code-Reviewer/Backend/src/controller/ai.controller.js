const aiService = require("../services/ai.service");
const connectDB = require("../db");

module.exports.getReview = async (req, res) => {
  const code = req.body.code;
  const language = req.body.language || "javascript";

  if (!code) {
    return res.status(400).send("Prompt is required");
  }

  try {
    let responseText = await aiService(code);
    let terminalError = null;

    // 1. Programmatic JS Syntax Check
    if (language === "javascript") {
      const vm = require("vm");
      try {
        new vm.Script(code);
      } catch (e) {
        if (e instanceof SyntaxError) {
          let stack = e.stack || "";
          stack = stack.replace(/evalmachine\.<anonymous>/g, "index.js");
          terminalError = `[Running] node "index.js"\n${stack}`;
        }
      }
    }

    // 2. Parse AI-generated terminal error if programmatic check didn't catch one or if we want to combine
    const terminalErrorRegex = /\[TERMINAL_ERROR\]([\s\S]*?)\[\/TERMINAL_ERROR\]/;
    const match = responseText.match(terminalErrorRegex);
    if (match) {
      if (!terminalError) {
        terminalError = match[1].trim();
      }
      responseText = responseText.replace(terminalErrorRegex, "").trim();
    }

    let db;
    try {
      db = await connectDB();
    } catch (dbError) {
      console.error("Failed to connect to database for logging:", dbError.message);
    }
    if (db) {
      try {
        await db.collection("reviews").insertOne({
          code,
          language,
          review: responseText,
          error: terminalError,
          createdAt: new Date()
        });
      } catch (dbError) {
        console.error("Failed to save review to database:", dbError.message);
        // Do not fail the whole request just because history save failed
      }
    }

    res.json({
      review: responseText,
      error: terminalError
    });
  } catch (error) {
    console.error("Error processing code review:", error);
    res.status(500).json({
      error: "❌ Error fetching review from AI Engine. Please check server logs and try again."
    });
  }
};

module.exports.getHistory = async (req, res) => {
  try {
    const db = await connectDB();
    const reviews = await db.collection("reviews")
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const formattedHistory = reviews.map(item => ({
      id: item._id.toString(),
      language: item.language || "javascript",
      code: item.code,
      review: item.review,
      error: item.error || null,
      date: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch review history" });
  }
};

module.exports.clearHistory = async (req, res) => {
  try {
    const db = await connectDB();
    await db.collection("reviews").deleteMany({});
    res.json({ message: "History cleared successfully" });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ error: "Failed to clear history" });
  }
};
