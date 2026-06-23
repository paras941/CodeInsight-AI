const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

const client = new MongoClient(uri);
let dbConnection = null;

async function connectDB() {
  if (dbConnection) {
    return dbConnection;
  }
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    dbConnection = client.db();
    return dbConnection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw error;
  }
}

function getDB() {
  return dbConnection;
}

module.exports = connectDB;
module.exports.getDB = getDB;
