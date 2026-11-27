
import { tool } from "langchain";
import * as z from "zod";
import axios from "axios";

// Common error handler
const handleToolError = (toolName, error) => {
  console.error("================================");
  console.error(`${toolName} ERROR`);
  console.error("================================");

  if (axios.isAxiosError(error)) {
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Request URL:", error.config?.url);
    console.error("HTTP Status:", error.response?.status);
    console.error("Backend Response:", error.response?.data);
  } else {
    console.error("Error:", error);
  }

  console.error("================================");

  return JSON.stringify({
    success: false,
    tool: toolName,
    message: error.message,
    status: error.response?.status || null,
    code: error.code || null,
    backendResponse: error.response?.data || null,
  });
};


// LIST FILES TOOL
export const listFilesTool = tool(
  async ({},config) => {
    try {
       const writer = config.writer;
       writer("Listing files...\n");    
  
      const result = await axios.get(
        `http://sandbox-service-${config.context.projectId}:3000/list-files`
      );

      writer("Listed files successfully.\n"+"Files: " + result.data.file.join(", ") + "\n");

      return JSON.stringify({
        success: true,
        files: result.data.file,
      });

    } catch (error) {
      return handleToolError("listFilesTool", error);
    }
  },
  {
    name: "list_files",
    description: "List all files in the project directory.",
    schema: z.object({}),
  }
);

// READ FILES TOOL
export const readFilesTool = tool(
  async ({ files }, config) => {
    try {
      const writer = config.writer;
      writer("Reading files...\n");
      writer("Files: " + files.join(", ") + "\n");

      const result = await axios.get(
        `http://sandbox-service-${config.context.projectId}:3000/read-files`,
        {
          params: {
            files: files.join(","),
          },
        }
      );

      writer(
  "File contents: " +
  JSON.stringify(result.data.result, null, 2) +
  "\n"
);
      writer("Read files successfully.\n");

      return JSON.stringify({
        success: true,
        result: result.data.result,
      });

    } catch (error) {
      return handleToolError("readFilesTool", error);
    }
  },
  {
    name: "read_files",
    description: "Read the contents of specified files.",
    schema: z.object({
      files: z.array(z.string()).describe(
        "The list of absolute file paths to read."
      ),
    }),
  }
);

// UPDATE FILES TOOL
export const updateFilesTool = tool(
  async ({ files }, config) => {
    try {
      const writer = config.writer
      writer("Updating files..."+files.map(f => f.file).join(", ") + "\n");

      const result = await axios.patch(
        `http://sandbox-service-${config.context.projectId}:3000/update-files`,
        {
          updates: files,
        }
      );

      writer("Files updated: "+JSON.stringify(result.data.result, null, 2) + "\n");
      writer("Updated files successfully.\n");

      return JSON.stringify({
        success: true,
        result: result.data.result,
      });

    } catch (error) {
      return handleToolError("updateFilesTool", error);
    }
  },
  {
    name: "update_files",
    description:
      "Update existing files or create new files by providing file paths and content.",
    schema: z.object({
      files: z.array(
        z.object({
          file: z.string(),
          content: z.string(),
        })
      ),
    }),
  }
);
