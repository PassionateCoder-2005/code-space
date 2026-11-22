import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
        const targetUrl = `http://sandbox-service-${sandboxId}`;
        proxies[sandboxId] = createProxyMiddleware({
            target: targetUrl,
            changeOrigin: true,
            ws: true,
        });
    }
    return proxies[sandboxId];
}
function getAgentProxy(sandboxId) {
    if (!agentProxies[sandboxId]) {
        const targetUrl = `http://sandbox-service-${sandboxId}:3000`;
        agentProxies[sandboxId] = createProxyMiddleware({
            target: targetUrl,
            changeOrigin: true,
            ws: true,
        });
    }
    return agentProxies[sandboxId];
}
// Setting up a proxy middleware to forward requests to the appropriate sandbox service based on the subdomain
app.use((req, res, next) => {
   const host = req.headers.host;
   const sandboxId = host.split(".")[0];
   if(host.split(".")[1] === "agent"){
    const agentProxy = getAgentProxy(sandboxId);
    agentProxy(req, res, next);
   }
   else if(host.split(".")[1] === "preview"){
    const proxy = getProxy(sandboxId);
    proxy(req, res, next);
   }
 });
export default app;