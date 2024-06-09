import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

const app = express();
const server = http.createServer(app);

app.use(express.static("public"));

const wss = new WebSocketServer({ server });

const lastMessages = [];
const addLastmessages = (message) => {
  if (lastMessages.length === 200) {
    lastMessages.shift();
  }
  lastMessages.push(message);
};

wss.on("connection", function connection(ws) {
  const userId = uuid();
  ws.userId = userId;
  ws.on("error", console.error);

  ws.on("message", function message(msg) {
    const megStr = String(msg);
    const data = JSON.parse(megStr);
    if (data.type === "message") {
      addLastmessages(data);
      wss.clients.forEach(function each(client) {
        if (
          client.readyState === WebSocket.OPEN &&
          client.userId !== ws.userId
        ) {
          client.send(megStr);
        }
      });
    }
  });

  ws.send(JSON.stringify({ type: "user", id: userId, lastMessages }));
});

const port = 3000;
server.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
