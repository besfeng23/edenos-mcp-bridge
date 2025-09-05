import { Router } from "express";
import { spawn } from "child_process";
export const rewindRouter = Router();
rewindRouter.post("/snapshot", async (req, res) => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const label = req.body.label || ts;
    try {
        // Firestore export
        await sh(`gcloud firestore export ${process.env.FIRESTORE_EXPORT_BUCKET || 'gs://edenos-fs-exports'}/${label} --project ${process.env.GCP_PROJECT_ID || 'agile-anagram-469914-e2'}`);
        // BigQuery snapshot (dataset copy)
        await sh(`bq ls ${process.env.BQ_PROD_DATASET || 'edenos_prod'}`); // sanity
        await sh(`bq mk ${process.env.BQ_PROD_DATASET || 'edenos_prod'}_${label}`);
        await sh(`bq cp -r ${process.env.BQ_PROD_DATASET || 'edenos_prod'} ${process.env.BQ_PROD_DATASET || 'edenos_prod'}_${label}`);
        res.json({ ok: true, label });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
rewindRouter.post("/restore", async (req, res) => {
    const { label, toEnv } = req.body;
    if (!label || !toEnv)
        return res.status(400).json({ error: "label,toEnv required" });
    try {
        // Firestore import to a separate project/tenant is safer
        // BigQuery: use snapshot dataset
        res.json({
            ok: true,
            dataset: `${process.env.BQ_PROD_DATASET || 'edenos_prod'}_${label}`,
            note: "Firestore restore requires target project or fully isolated instance. Use export path above."
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
function sh(cmd) {
    return new Promise((res, rej) => {
        const p = spawn(cmd, { shell: true, stdio: "inherit" });
        p.on("exit", (c) => c === 0 ? res() : rej(new Error(cmd)));
    });
}
