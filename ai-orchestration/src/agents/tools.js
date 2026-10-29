import { tool } from "langchain";
import axios from "axios";
import * as z from "zod";
export const listFiles = tool(
    async ({},config) => {
        const writer = config.writer;
         writer("Listing files in the project directory");
         const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/list-files`);
         writer("Files listed successfully"+"Files: "+response.data.files.join(",")+"\n");

         return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all files in the project directory. This is useful for understanding the project structure and identifying available files.",
        schema: z.object({}),
    },
);

export const readFiles = tool(
    async ({ files},config) => {
       const writer = config.writer;
        writer("Reading files in the project directory"+files.join(",")+"\n");
        const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/read-files?files=`+files.join(","));
        writer("Files read successfully");       
        
        return JSON.stringify(response.data);
    },
    {
        name: "read_files",
        description: "Read the content of specific files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("The list of the files absolute paths to read. These should be files that were listed using the list_files tool or created later."),
        }),
    },
);

export const updateFiles = tool(
    async ({ files },config) => {
        const writer = config.writer;
        writer("Updating files in the project directory"+files.map(f => f.file).join(",")+"\n");
        try {
            const response = await axios.patch(
                `http://sandbox-service-${config.context.projectId}:3000/update-file`,
                { updates: files }
            );
            writer("Files updated successfully");
            return JSON.stringify(response.data);
        } catch (err) {
            const detail = err.response?.data
                ? JSON.stringify(err.response.data)
                : err.message;
            console.log("======================")
            console.log("updateFiles error:", detail);
            console.log("======================")
            return `Request failed: ${detail}`;
        }
    },
    {
        name: "update_files",
        description: "Update the content of specific files. This is useful for making changes to files based on the requirements of the task at hand. This tool can also be used to create new files by providing a new file name in the file field and the content to be added in the content field.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The absolute path to the file to update."),
                content: z.string().describe("The new content for the file, the content should support json format."),
            })).describe("The list of files to update and their new contents."),
        }),
    },
);
