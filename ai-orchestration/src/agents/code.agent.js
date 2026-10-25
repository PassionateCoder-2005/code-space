import { ChatGoogle } from "@langchain/google";
import { createAgent } from "langchain";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import dotenv from "dotenv";

dotenv.config();
const model = new ChatGoogle({
    model: "gemini-3.6-flash",
    apiKey: process.env.GEMINI_KEY,
    temperature: 0,   
});
const agent = createAgent({
    model,
    tools: [listFiles, readFiles, updateFiles],
});

const result = await agent.invoke({
    messages: [
        {
            role: "user",
    content: `Create a simple mario sort of game in the project using React and CSS.

First, use list_files to inspect the project.
Then, use read_files to read the relevant existing files.
Finally, use update_files to write the changes.
Actually call the tools and save the code.`,
        },
    ],
});

console.log("FINAL AGENT RESULT:", result);