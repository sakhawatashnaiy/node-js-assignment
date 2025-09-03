require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Task = require("./models/task");

const app = express();
app.use(express.json());
 console.log("Mongo URI:", process.env.MONGODB_URI)
// ✅ static files serve karne ke liye
app.use(express.static(path.join(__dirname, "../public")));

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
 

  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// --- CRUD Routes ---
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const task = new Task({ title: req.body.title });
  await task.save();
  res.json(task);
});

app.put("/api/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
});

app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
