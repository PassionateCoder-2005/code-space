import express from "express";
import morgan from "morgan";
import fs from "fs";
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const workdir="/workspace";

// List files
app.get("/list-files",async (req, res) => {
      const files = await fs.promises.readdir(workdir);
      return res.status(200).json({
        message: "Files in the working directory",
        files: files,
      });
})

export default app;