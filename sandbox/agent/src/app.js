import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
    const WORKDIR="/workspace";
app.get("/", (req, res) => {
   return res.status(200).json({ message: "Hello from sandbox agent!",
sucess: true });    
    });
app.get("/list-files", async(req, res) => {
    const listFiles = async (dir,baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files=[];
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            if (entry.isDirectory() && [".git", "node_modules","dist"].includes(entry.name)) {   
                continue; // Skip .git, node_modules, and dist directories
            }
            if (entry.isDirectory()) {
                const subFiles = await listFiles(fullPath,baseDir);
                files.push(...subFiles);
            } else {
                files.push(relativePath);
            }
        }
        return files;
    };
    try {
        const files = await listFiles(WORKDIR,WORKDIR);
        return res.status(200).json({
            message: "Files listed successfully",
            files: files
        });
    } catch (error) {
        return res.status(500).json({
            message: `Error in listing files: ${error.message}`,
            status: "error"
        });
        
    }

});

app.get("/read-files",async (req,res) => {
    const files=req.query.files;
    if(!files){
        return res.status(400).json({
            message:"No specified files",
            status:"error"
        })
    }
    const fileList=files.split(",");
    const result=await Promise.all(fileList.map(async (file) => {
        const filePath=path.join(WORKDIR,file);
        try {
            const content=await fs.promises.readFile(filePath,"utf-8")
            return {
                [filePath.replace(WORKDIR, "")]:content
            }
        } catch (error) {
            return {
                [fileList.replace(WORKDIR, "")]:`Error in reading file : ${error.message}`
            }
        }
        
    }))
    return res.status(200).json({
        message:"Files content",
        files:result
    })
})
app.patch("/update-file",async (req,res) => {
    const updates=req.body.updates;
    if(!updates || !Array.isArray(updates)){
        return res.status(400).json({
            message:"Invalid update data",
            status:"error"
        })
    }
    const result=await Promise.all(updates.map(async (update) => {
        const {file,content}=update;
        const filePath=path.join(WORKDIR,file);
        try {
            await fs.promises.writeFile(filePath
,content,"utf-8")
            return {
                [filePath]:"File updated successfully"
            }
        }
        catch (error) {
            return {
                [filePath]:`Error in updating file : ${error.message}`
            }
        }
    }))
    return res.status(200).json({
        message:"Files update result",
        files:result
    })
})
app.post("/create-file",async (req,res) => {
   const files=req.body.files;
   if(!files || !Array.isArray(files)){
    return res.status(400).json({
        message:"Invalid files data",
        status:"error"
    })
   }
   const result=await Promise.all(files.map(async (objFile) => {
    const {file,content}=objFile;
    const filePath=path.join(WORKDIR,file);  
    try {
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath,content,"utf-8")
        return {
            [filePath]:"File created successfully"
        }
    } catch (error) {
        return {
            [filePath]:`Error in creating file : ${error.message}`
        }
    }
}))
    return res.status(201).json({
        message:"Files creation result",
        files:result
    })
})


export default app; 