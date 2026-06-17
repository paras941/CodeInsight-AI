const aiService = require("../services/ai.service");
const { getDB } = require("../db");

module.exports.getReview = async (req, res) => {
  const code = req.body.code;
  const language = req.body.language || "javascript";

  if (!code) {
    return res.status(400).send("Prompt is required");
  }

  try {
    const response = await aiService(code);

    const db = getDB();
    if (db) {
      try {
        await db.collection("reviews").insertOne({
          code,
          language,
          review: response,
          createdAt: new Date()
        });
      } catch (dbError) {
        console.error("Failed to save review to database:", dbError.message);
        // Do not fail the whole request just because history save failed
      }
    }

    res.send(response);
  } catch (error) {
    console.error("Error processing code review:", error);
    res.status(500).send("❌ Error fetching review from AI Engine. Please check server logs and try again.");
  }
};

module.exports.getHistory = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
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
    const db = getDB();
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    await db.collection("reviews").deleteMany({});
    res.json({ message: "History cleared successfully" });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ error: "Failed to clear history" });
  }
};
