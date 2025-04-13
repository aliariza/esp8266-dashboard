const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

let latestData = null;
let latestCommand = null;

app.post("/api/data", (req, res) => {
  latestData = req.body;
  console.log("Data received:", latestData);
  res.send({ status: "OK" });
});

app.post("/api/command", (req, res) => {
  latestCommand = req.body.command;
  console.log("Command set:", latestCommand);
  res.send({ status: "Command stored" });
});

app.get("/api/command", (req, res) => {
  res.send({ command: latestCommand || "none" });
});

app.get("/api/data", (req, res) => {
  res.send(latestData || { temperature: null, timestamp: null });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
