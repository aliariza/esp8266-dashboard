const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

let latestData = null;

// === WebSocket Setup ===
let wsClient = null;

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", function connection(ws) {
  console.log("🔌 WebSocket client connected");
  wsClient = ws;

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
    wsClient = null;
  });
});

// === API Routes ===

// receive temperature data from ESP
app.post("/api/data", (req, res) => {
  latestData = req.body;
  console.log("📡 Data received:", latestData);
  res.send({ status: "OK" });
});

// Web UI fetches last data
app.get("/api/data", (req, res) => {
  res.send(latestData || { temperature: null, timestamp: null });
});

// receive command from UI → send to ESP via WebSocket
app.post("/api/command", (req, res) => {
  const command = req.body.command;
  console.log("📲 Command set:", command);

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({ command }));
    console.log("📤 Command sent via WebSocket");
    res.send({ status: "Command sent via WebSocket" });
  } else {
    console.log("⚠️ No ESP connected via WebSocket");
    res.status(503).send({ status: "No ESP connected" });
  }
});

// serve dashboard UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// === Launch Express HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// === WebSocket upgrade handling
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
