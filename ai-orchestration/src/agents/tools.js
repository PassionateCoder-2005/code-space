
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
  async ({}) => {
    try {
      console.log("Using listFilesTool...");

      const result = await axios.get(
        "http://sandbox-service-01a2168a-b944-70c9-995e-6b8d66873031:3000/list-files"
      );

      console.log("Files fetched:", result.data.file);

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
  async ({ files }) => {
    try {
      console.log("Using readFilesTool...");
      console.log("Files:", files);

      const result = await axios.get(
        "http://sandbox-service-01a2168a-b944-70c9-995e-6b8d66873031:3000/read-files",
        {
          params: {
            files: files.join(","),
          },
        }
      );

      console.log("File contents:", result.data.result);

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
  async ({ files }) => {
    try {
      console.log("Using updateFilesTool...");
      console.log("Updates:", files);

      const result = await axios.patch(
        "http://sandbox-service-01a2168a-b944-70c9-995e-6b8d66873031:3000/update-files",
        {
          updates: files,
        }
      );

      console.log("Files updated:", result.data.result);

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
