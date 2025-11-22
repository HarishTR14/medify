const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all medicines
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM medicines ORDER BY time");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new medicine
router.post("/", async (req, res) => {
  const { name, time, description } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO medicines (name, time, description) VALUES (?, ?, ?)",
      [name, time, description || null]
    );
    res.status(201).json({ id: result.insertId, name, time, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete medicine
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM medicines WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as taken today
router.post("/:id/take", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    await db.query(
      `INSERT INTO taken_logs (medicine_id, date, taken)
       VALUES (?, ?, TRUE)
       ON DUPLICATE KEY UPDATE taken = TRUE`,
      [req.params.id, today]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
