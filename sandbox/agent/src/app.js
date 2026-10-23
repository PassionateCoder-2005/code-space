import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
const app = express();
app.use(morgan('dev'));
    const WORKDIR="/workspace";
app.get("/", (req, res) => {
   return res.status(200).json({ message: "Hello from sandbox agent!",
sucess: true });    
    });
app.get("/list-files", async(req, res) => {
    const files=await fs.promises.readdir(WORKDIR);
   return res.status(200).json({ message: "Files in workspace",
sucess: true, files:files });    
    }
);
export default app;