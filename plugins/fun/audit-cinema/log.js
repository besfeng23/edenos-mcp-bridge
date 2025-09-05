import { Logging } from "@google-cloud/logging";
import { Router } from "express";
const logging = new Logging();
export const auditRouter = Router();
export async function audit(evt) {
    try {
        const log = logging.log("edenos-audit");
        const entry = log.entry({ resource: { type: "global" } }, { ts: Date.now(), ...evt });
        await log.write(entry);
    }
    catch (error) {
        console.error("Audit logging failed:", error);
    }
}
auditRouter.get("/tail", async (req, res) => {
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
