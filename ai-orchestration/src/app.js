import express from "express";
const app = express();
app.get("/api/ai/healthz", (req, res) => {
  return res.status(200).json({ status: "ok" });
});
export default app;