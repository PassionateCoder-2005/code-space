import {Router} from "express";
import agent from "../agents/code.agent.js";

const aiRouter = Router();
aiRouter.post("/invoke", async (req, res) => {
    try {
        const {prompt,projectId}=req.body;
        if(!prompt){
            return res.status(400).json({
                message: "Please provide a prompt in the request body."
            });
        }
        res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Prevents Nginx/proxies from buffering the stream
  });
        // Call the AI agent with the provided prompt
        const result=await agent.stream({
            messages: [
                {
                    role: "user",
                    content: prompt,
                    
                }
            ]
        },
    {
        context: {
            projectId: projectId
        },
        streamMode:"custom"
    }

    );
    for await (const chunk of result) {
        console.log(chunk);
        res.write(`data: ${chunk}\n\n`);
    }
        res.end();
    } catch (error) {
        console.error("Error invoking AI agent:", error);
        return res.status(500).json({
            message: "An error occurred while invoking the AI agent."
        });
    }
});
export default aiRouter;