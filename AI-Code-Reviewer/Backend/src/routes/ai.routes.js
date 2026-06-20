const express = require("express");
const aiController = require("../controller/ai.controller");

const router = express.Router();

router.post("/get-review", aiController.getReview);
router.get("/history", aiController.getHistory);
router.delete("/history", aiController.clearHistory);

module.exports = router;
