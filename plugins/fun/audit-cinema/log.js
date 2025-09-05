"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
exports.audit = audit;
const logging_1 = require("@google-cloud/logging");
const express_1 = require("express");
const logging = new logging_1.Logging();
exports.auditRouter = (0, express_1.Router)();
async function audit(evt) {
    try {
        const log = logging.log("edenos-audit");
        const entry = log.entry({ resource: { type: "global" } }, { ts: Date.now(), ...evt });
        await log.write(entry);
    }
    catch (error) {
        console.error("Audit logging failed:", error);
    }
}
exports.auditRouter.get("/tail", async (req, res) => {
    try {
        const [entries] = await logging.getEntries({
            filter: `logName="projects/${process.env.GCP_PROJECT_ID || 'agile-anagram-469914-e2'}/logs/edenos-audit"`,
            pageSize: 200
        });
        res.json(entries.map(e => e.data));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
