import {Router} from "express";
import agent from "../agents/code.agent.js";
const agentRouter = Router();
agentRouter.post("/invoke", async (req, res) => {
    try {
        const {message,projectId} = req.body;
        // Set headers for Server-Sent Events (SSE)
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
   
        const result = await agent.stream(
            { messages: [{role: "user", content: message}] },{
            context: {
                projectId
            },
            streamMode:"custom"
        });
        for await (const chunk of result) {
            console.log(chunk);
            res.write(`data: ${chunk}\n\n`); // Send each chunk as an SSE event
        }
     res.json({result});
    } catch (error) {
        console.error("Error invoking agent:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default agentRouter;