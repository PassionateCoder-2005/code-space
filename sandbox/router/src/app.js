import express from "express";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const app = express();
app.use(morgan("combined"));

app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}`,
      changeOrigin: true,
    });
  }
  return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}:3000`,
      changeOrigin: true,
    });
  }
  return agentProxies[sandboxId];
}

app.use((req, res, next) => {
  const parts = req.headers.host.split(".");
  const sandboxId = parts[0];
  if (parts[1] === "agent") {
    return getAgentProxy(sandboxId)(req, res, next);
  }
  return getProxy(sandboxId)(req, res, next);
});

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  const parts = req.headers.host.split(".");
  const sandboxId = parts[0];
  const type = parts[1];
  console.log(`Upgrade request: ${req.headers.host}, sandboxId: ${sandboxId}, type: ${type}`);

  if (type === "agent") {
    getAgentProxy(sandboxId).upgrade(req, socket, head);
  } else if (type === "preview") {
    getProxy(sandboxId).upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

export default server;