import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const workdir="/workspace";

// List files
app.get("/list-files", async (req, res) => {
  const listFiles = async (dir, baseDir) => {
    const entries = await fs.promises.readdir(dir, {
      withFileTypes: true,
    });

    const ignoredDirs = ["node_modules", "dist", ".git"];

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (ignoredDirs.includes(entry.name)) return [];

          return await listFiles(fullPath, baseDir);
        }

        return path.relative(baseDir, fullPath);
      })
    );

    return files.flat();
  };

  try {
    const files = await listFiles(workdir, workdir);

    return res.status(200).json({
      file: files,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to list files",
      error: error.message,
    });
  }
});

// Read file content
app.get("/read-files",async (req, res) => {
    const fileList=req.query.files;
    if(!fileList){
        return res.status(400).json({
            message: "Please provide a file name in the query parameter 'files'."
        });
    }
    const files= fileList.split(",");
    const result=await Promise.all(files.map(async (file) => {
        const filePath = path.join(workdir, file);
        try {
            const content = await fs.promises.readFile(filePath, "utf-8");
            return { 
                [filePath.replace(workdir,"")]: content
            };
        }
        catch (err) {
            return { 
                [filePath.replace(workdir,"")]: `Error reading file: ${err.message}`
            
            };
        }
    }));
    return res.status(200).json({
        message: "File contents",
        result: result,
    });
}
);

// Update file content
app.patch("/update-files",async (req, res) => {
    const updates=req.body.updates;
    if(!updates || !Array.isArray(updates)){
        return res.status(400).json({
            message: "Please provide an array of updates in the request body."
        });
    }
    const result=await Promise.all(updates.map(async (update) => {
         const { file, content } = update;
         const filePath=path.join(workdir, file);
         try {
            await fs.promises.writeFile(filePath, content, "utf-8");
            return { 
                [filePath]: "File updated successfully"
            };
         }
            catch (err) {
            return {
                [filePath]: `Error updating file: ${err.message}`
            };
        }
    }));
    return res.status(200).json({
        message: "File update results",
        result: result,
    });
}
);

// Create a new file
app.post("/create-files",async (req, res) => {
   const files=req.body.files;
   if(!files || !Array.isArray(files)){
        return res.status(400).json({
            message: "Please provide an array of files in the request body."
        });
    }
    const result=await Promise.all(files.map(async (elems) => {
        const { file, content } = elems;
        if(!file || !content){
            return {
                [file]: "Please provide both 'file' and 'content' for each file."
            };
        }
        const filePath=path.join(workdir, file);
        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, "utf-8");
            return { 
                [filePath]: "File created successfully"
            };
        }
        catch (err) {
            return { 
                [filePath]: `Error creating file: ${err.message}`
            };
        }
    }));
    return res.status(200).json({
        message: "File creation results",
        result: result,
    });
});

export default app;