import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURSES = [
  { id: "CSE101", title: "Introduction to Computer Engineering", credits: 6 },
  { id: "CSE204", title: "Database Management Systems", credits: 5 },
  { id: "CSE301", title: "Operating Systems", credits: 6 },
  { id: "CSE308", title: "Web Programming", credits: 5 },
];

let requestsServed = 0;

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

app.use(requestLogger);
app.use(requestCounter);

app.use(express.static(path.join(__dirname, "public")));

app.get("/hello", (req, res) => {
  res.type("text/plain").send("Hello from Volga's server");
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nDisallow: /api/admin\n");
});

app.get("/old-page", (req, res) => {
  res.redirect("/hello");
});

app.get("/api/courses", (req, res) => {
  res.json(COURSES);
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get("/api/headers", (req, res) => {
  res.json({
    "User-Agent": req.get("User-Agent") || "",
    Accept: req.get("Accept") || "",
  });
});

app.post("/api/subscribe", (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get("/api/admin", (req, res) => {
  res.status(403).json({ error: "Forbidden" });
});

app.get("/api/stats", (req, res) => {
  res.json({ requestsServed });
});

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res
    .status(404)
    .type("text/html")
    .send(
      "<h1>404 - Page Not Found</h1><p>The page you requested does not exist.</p>",
    );
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
