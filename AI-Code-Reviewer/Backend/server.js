require("dotenv").config();
const app = require("./src/app");

const connectDB = require("./src/db");

const PORT = process.env.PORT || 3000;

// Initialize database connection on startup
connectDB()
  .then(() => {
    console.log("Database initialized successfully.");
  })
  .catch((err) => {
    console.error("Database initialization failed:", err.message);
  });

// Start listening ONLY in local development or traditional hosting
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export app for Vercel Serverless Functions
module.exports = app;
