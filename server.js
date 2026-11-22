
/*
=========================================================
IPT1 - Campus Event Registration System
Backend: Node.js + Express
Run: npm install, then npm start
Open: http://localhost:3000
=========================================================
*/

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------

app.use(cors()); 
// Allows requests from other origins.

app.use(express.json()); 
// Converts incoming JSON request bodies into JavaScript objects.

app.use(express.static(path.join(__dirname, "public")));
// Serves index.html and app.js from the public folder.

app.use((req, res, next) => {
  // Displays every incoming request in the terminal.
  console.log(
    `${new Date().toLocaleTimeString()} ${req.method} ${req.url}`
  );

  next();
});

// ---------- Database (In-Memory Storage) ----------

// Stores event registrations.
// Data resets whenever the server restarts.

let registrations = [];
let nextId = 1;

// ---------- Routes ----------

// GET: Retrieve all event registrations
app.get("/api/events", (req, res) => {
  res.status(200).json(registrations);
});

// POST: Create a new event registration
app.post("/api/events", (req, res) => {
  const { name, section, event } = req.body || {};

  // Validate required fields
  if (
    typeof name !== "string" || !name.trim() ||
    typeof section !== "string" || !section.trim() ||
    typeof event !== "string" || !event.trim()
  ) {
    return res.status(400).json({
      error: "Name, section, and event are required."
    });
  }

  // Validate maximum character lengths
  if (
    name.trim().length > 80 ||
    section.trim().length > 20 ||
    event.trim().length > 100
  ) {
    return res.status(400).json({
      error: "Name must be 80 characters or fewer, section 20 or fewer, and event 100 or fewer."
    });
  }

  // Create a new registration
  const registration = {
    id: nextId++,
    name: name.trim(),
    section: section.trim(),
    event: event.trim()
  };

  // Save registration
  registrations.push(registration);

  // Return the newly created registration
  return res.status(201).json(registration);
});

// DELETE: Remove a registration by ID
app.delete("/api/events/:id", (req, res) => {
  const id = Number(req.params.id);

  // Validate registration ID
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: "A valid registration ID is required."
    });
  }

  // Find registration
  const index = registrations.findIndex(
    registration => registration.id === id
  );

  // Check if registration exists
  if (index === -1) {
    return res.status(404).json({
      error: "Registration not found."
    });
  }

  // Remove registration
  registrations.splice(index, 1);

  return res.status(204).send();
});

// ---------- Handle Unknown API Routes ----------

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found."
  });
});

// ---------- Handle Invalid JSON ----------

app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      error: "Invalid JSON request body."
    });
  }

  next(err);
});

// ---------- Start Server ----------

app.listen(PORT, () => {
  console.log(
    `Campus Event Registration System is running at http://localhost:${PORT}`
  );
});