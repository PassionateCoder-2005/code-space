import {Router} from "express";
import agent from "../agents/code.agent.js";
const agentRouter = Router();
agentRouter.post("/invoke", async (req, res) => {
    try {
        const {message} = req.body;
        const result = await agent.invoke({ messages: [{role: "user", content: message}] },{
            recursionLimit:50
        });
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error invoking agent:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default agentRouter;