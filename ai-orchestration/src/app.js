import express from "express";
import agentRouter from "./routes/agent.routes.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/ai/healthz", (req, res) => {
  return res.status(200).json({ status: "ok" });
}); 
app.use("/api/ai", agentRouter);
export default app;