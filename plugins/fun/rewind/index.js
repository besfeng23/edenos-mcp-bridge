"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewindRouter = void 0;
const express_1 = require("express");
const child_process_1 = require("child_process");
exports.rewindRouter = (0, express_1.Router)();
exports.rewindRouter.post("/snapshot", async (req, res) => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const label = req.body.label || ts;
    try {
        await sh(`gcloud firestore export ${process.env.FIRESTORE_EXPORT_BUCKET || 'gs://edenos-fs-exports'}/${label} --project ${process.env.GCP_PROJECT_ID || 'agile-anagram-469914-e2'}`);
        await sh(`bq ls ${process.env.BQ_PROD_DATASET || 'edenos_prod'}`);
        await sh(`bq mk ${process.env.BQ_PROD_DATASET || 'edenos_prod'}_${label}`);
        await sh(`bq cp -r ${process.env.BQ_PROD_DATASET || 'edenos_prod'} ${process.env.BQ_PROD_DATASET || 'edenos_prod'}_${label}`);
        res.json({ ok: true, label });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.rewindRouter.post("/restore", async (req, res) => {
    const { label, toEnv } = req.body;
    if (!label || !toEnv)
        return res.status(400).json({ error: "label,toEnv required" });
    try {
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
        const p = (0, child_process_1.spawn)(cmd, { shell: true, stdio: "inherit" });
        p.on("exit", (c) => c === 0 ? res() : rej(new Error(cmd)));
    });
}
