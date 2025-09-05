"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doppelRouter = void 0;
exports.logCmd = logCmd;
const aiplatform_1 = require("@google-cloud/aiplatform");
const express_1 = require("express");
const client = new aiplatform_1.DiscussServiceClient();
exports.doppelRouter = (0, express_1.Router)();
const history = [];
function logCmd(c) {
    history.push(`[${new Date().toISOString()}] ${c}`);
    if (history.length > 200)
        history.shift();
}
exports.doppelRouter.post("/plan", async (req, res) => {
    try {
        const prompt = [
            "You are EdenOS Operator. Given recent commands, propose the next 5 commands for this week.",
            "Return JSON array: [{title, command, reason}]",
            "History:\n" + history.join("\n")
        ].join("\n");
        const [resp] = await client.generateMessage({
            model: process.env.VERTEX_TEXT_MODEL || 'publishers/google/models/gemini-1.5-pro',
            temperature: 0.3,
            prompt: { messages: [{ author: "user", content: prompt }] }
        });
        const text = resp.candidates?.[0]?.content || "[]";
        try {
            res.json(JSON.parse(text));
        }
        catch {
            res.json([{ title: "Plan", command: "echo fix your parsing", reason: text }]);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
