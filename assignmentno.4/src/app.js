
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Response wrapper middleware (same structure for every response) ---
app.use((req, res, next) => {
  res.api = (data = null, message = "", status = 200, success = true) =>
    res.status(status).json({ success, message, data });
  res.apiError = (message = "Error", status = 400) =>
    res.status(status).json({ success: false, message, data: null });
  next();
});

// --- Mongo setup ---
const uri = 'mongodb+srv://sakhawatashnaiy09_db_user:k3ltLgXRtKnx81T5@cluster0.4ceqqia.mongodb.net/';
const dbName = 'Tododata';
const collectionName = 'addingdata';

if (!uri) {
  console.error("MONGODB_URI missing in .env");
  process.exit(1);
}

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
});

let collection;
async function initDb() {
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection(collectionName);
  await collection.createIndex({ createdAt: -1 });
  console.log("Connected to MongoDB");
}
initDb().catch((e) => {
  console.error("Mongo init error:", e);
  process.exit(1);
});

// helpers
const toObjectId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);
const sanitizeCreate = (body) => {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const completed = Boolean(body.completed ?? false);
  if (!title) return { error: "title is required (non-empty string)" };
  return { title, description, completed, createdAt: new Date(), updatedAt: new Date() };
};

// --- Routes ---
// Health
app.get("/", (req, res) => res.api({ service: "todo-api", time: new Date() }, "OK"));

// Create
app.post("/api/todos", async (req, res) => {
  try {
    const doc = sanitizeCreate(req.body);
    if (doc.error) return res.apiError(doc.error, 400);
    const result = await collection.insertOne(doc);
    return res.api({ _id: result.insertedId, ...doc }, "Created", 201);
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// List (with filters)
app.get("/api/todos", async (req, res) => {
  try {
    const { completed, page = 1, limit = 10, search } = req.query;
    const q = {};
    if (completed === "true" || completed === "false") q.completed = completed === "true";
    if (search) q.title = { $regex: search.trim(), $options: "i" };
    const skip = (Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1);
    const lim = Math.min(Math.max(Number(limit), 1), 100);
    const [items, total] = await Promise.all([
      collection.find(q).sort({ createdAt: -1 }).skip(skip).limit(lim).toArray(),
      collection.countDocuments(q),
    ]);
    return res.api({ page: Number(page), limit: lim, total, items }, "List fetched");
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// Get single
app.get("/api/todos/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.apiError("Invalid id", 400);
    const todo = await collection.findOne({ _id });
    if (!todo) return res.apiError("Not found", 404);
    return res.api(todo, "Todo fetched");
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// Replace
app.put("/api/todos/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.apiError("Invalid id", 400);
    const doc = sanitizeCreate(req.body);
    if (doc.error) return res.apiError(doc.error, 400);
    doc.updatedAt = new Date();
    const result = await collection.findOneAndReplace({ _id }, doc, { returnDocument: "after" });
    if (!result.value) return res.apiError("Not found", 404);
    return res.api(result.value, "Replaced");
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// Patch (partial)
app.patch("/api/todos/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.apiError("Invalid id", 400);
    const $set = {};
    if (typeof req.body.title === "string") $set.title = req.body.title.trim();
    if (typeof req.body.description === "string") $set.description = req.body.description.trim();
    if (typeof req.body.completed === "boolean") $set.completed = req.body.completed;
    if (Object.keys($set).length === 0) return res.apiError("Provide at least one field", 400);
    $set.updatedAt = new Date();
    const result = await collection.findOneAndUpdate({ _id }, { $set }, { returnDocument: "after" });
    if (!result.value) return res.apiError("Not found", 404);
    return res.api(result.value, "Updated");
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// Delete
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.apiError("Invalid id", 400);
    const result = await collection.deleteOne({ _id });
    if (result.deletedCount === 0) return res.apiError("Not found", 404);
    return res.api(null, "Deleted");
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// Toggle
app.post("/api/todos/:id/toggle", async (req, res) => {
  try {
    const _id = toObjectId(req.params.id);
    if (!_id) return res.apiError("Invalid id", 400);
    const todo = await collection.findOne({ _id });
    if (!todo) return res.apiError("Not found", 404);
    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: { completed: !todo.completed, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return res.api(result.value, "Toggled");
  } catch (err) {
    console.error(err);
    return res.apiError("Server error", 500);
  }
});

// 404
app.use((req, res) => res.apiError("Route not found", 404));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

// graceful
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
