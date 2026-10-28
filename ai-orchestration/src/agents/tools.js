import { tool } from "langchain";
import axios from "axios";
import * as z from "zod";
export const listFiles = tool(
    async ({}) => {
        console.log("======================")
        console.log("Invoking listFiles tool");
        console.log("======================")

         const response = await axios.get("http://sandbox-service-01a18177-1ccd-742d-a466-8fb332cce84a:3000/list-files");
        console.log("======================")

         console.log("Response from listFiles tool:", response.data);
        console.log("======================")

         return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all files in the project directory. This is useful for understanding the project structure and identifying available files.",
        schema: z.object({}),
    },
);

export const readFiles = tool(
    async ({ files}) => {
        console.log("======================")
        console.log("Invoking readFiles tool");
        console.log("======================")
        const response = await axios.get(`http://sandbox-service-01a18177-1ccd-742d-a466-8fb332cce84a:3000/read-files?files=`+files.join(","));
        
        console.log("======================")
        console.log("Response from readFiles tool:", response.data);
        console.log("======================")
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
   async ({ files }) => {
      
        console.log("Invoking updateFiles tool");
        try {
            const response = await axios.patch(
                "http://sandbox-service-01a18177-1ccd-742d-a466-8fb332cce84a:3000/update-file",
                { updates: files }
            );
            console.log("Response from updateFiles tool:", response.data);
            return JSON.stringify(response.data);
        } catch (err) {
            const detail = err.response?.data
                ? JSON.stringify(err.response.data)
                : err.message;
            console.log("updateFiles error:", detail);
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
