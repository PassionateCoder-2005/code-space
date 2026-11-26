import {Router} from "express";
import agent from "../agents/code.agent.js";

const aiRouter = Router();
aiRouter.post("/invoke", async (req, res) => {
    try {
        const {prompt}=req.body;
        if(!prompt){
            return res.status(400).json({
                message: "Please provide a prompt in the request body."
            });
        }
        // Call the AI agent with the provided prompt
        const result=await agent.invoke({
            messages: [
                {
                    role: "user",
                    content: prompt,
                    
                }
            ]
        });
        return res.status(200).json({
            message: "AI agent invoked successfully.",
            result: result,
        });
    } catch (error) {
        console.error("Error invoking AI agent:", error);
        return res.status(500).json({
            message: "An error occurred while invoking the AI agent."
        });
    }
});
export default aiRouter;