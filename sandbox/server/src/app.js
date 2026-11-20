import express from "express";
import morgan from "morgan";
import { v7 as uuid } from 'uuid';
import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
const app= express();
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.get("/api/sandbox/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Hello from the sandbox server!",
  });
})
app.post("/api/sandbox/create", async (req, res) => {
  const sandboxId = uuid();
  await Promise.all([
    createPod(sandboxId),
    createService(sandboxId),
  ]);
  return res.status(201).json({
    status: "created",
    message: `Sandbox created with ID: ${sandboxId}`,
    previewUrl: `http://${sandboxId}.preview.localhost`,
  });
});

export default app;