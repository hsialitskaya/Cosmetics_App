const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const authRoutes = require("./routes/authRoutes");
const skinInfoRoutes = require("./routes/skinInfoRoutes");
const cosmeticRoutes = require("./routes/cosmeticRoutes");
const newDataRoutes = require("./routes/newDataRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const { wss } = require("./websocketServer");

const app = express();
app.use(cors());
app.use(express.json());

// Twoje istniejące ścieżki API
app.use("/api/auth", authRoutes);
app.use("/api", skinInfoRoutes);
app.use("/api", cosmeticRoutes);
app.use("/api", newDataRoutes);
app.use("/api", favoritesRoutes);
app.use("/api", commentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", userRoutes);
app.use("/api", feedbackRoutes);

// Serwer HTTP do hostowania strony
app.use(express.static(path.join(__dirname, "../frontend")));

// Obsługa dla /, aby dostarczać plik index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const privateKey = fs.readFileSync("../tls/klucz_haslo.key", "utf8");
const certificate = fs.readFileSync("../tls/certyfikat.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app);

// Połączenie serwera HTTP i WebSocket
const port = 5001;
server.listen(port, () => {
  console.log(`Serwer uruchomiony na https://localhost:${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
