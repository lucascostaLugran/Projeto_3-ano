const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/?", ""));
  const userId = params.get("userId");

  if (userId) {
    clients.set(userId, ws);
  }

  ws.on("close", () => {
    clients.forEach((client, id) => {
      if (client === ws) clients.delete(id);
    });
  });
});

global.sendNotification = (userId, notification) => {
  const client = clients.get(String(userId));
  if (client && client.readyState === 1) {
    client.send(JSON.stringify(notification));
  }
};

const authRoutes = require("./src/routes/auth");
app.use("/auth", authRoutes);
const artistRoutes = require("./src/routes/artists");
app.use("/artists", artistRoutes);
const albumRoutes = require("./src/routes/albums");
app.use("/albums", albumRoutes);
const requestRoutes = require("./src/routes/requests");
app.use("/requests", requestRoutes);
const notificationRoutes = require("./src/routes/notifications");
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});