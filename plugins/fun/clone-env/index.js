"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneRouter = void 0;
const child_process_1 = require("child_process");
const express_1 = require("express");
exports.cloneRouter = (0, express_1.Router)();
exports.cloneRouter.post("/clone", async (req, res) => {
    const { fromEnv = "prod", toEnv } = req.body;
    if (!toEnv)
        return res.status(400).json({ error: "toEnv required" });
    try {
        const stamp = Date.now();
        const suffix = `${toEnv}-${stamp}`;
        await sh(`bq --location=${process.env.GCP_REGION || 'asia-southeast1'} mk --dataset ${process.env.GCP_PROJECT_ID || 'agile-anagram-469914-e2'}:${suffix}`);
        await sh(`bq cp -r ${process.env.BQ_PROD_DATASET || 'edenos_prod'} ${suffix}`);
        await sh(`gsutil -m rsync -r gs://${process.env.GCS_PROD_BUCKET || 'edenos-prod-assets'} gs://${process.env.GCS_PROD_BUCKET || 'edenos-prod-assets'}-${suffix}`);
        await sh(`gcloud run services describe ${process.env.CLOUD_RUN_SERVICE || 'edenos-mcp-bridge'} --region ${process.env.GCP_REGION || 'asia-southeast1'} --format=json > /tmp/svc.json`);
        await sh(`gcloud run deploy ${process.env.CLOUD_RUN_SERVICE || 'edenos-mcp-bridge'}-${suffix} --image $(jq -r '.status.latestCreatedRevisionName' /tmp/svc.json | sed 's/.*/REPLACE_WITH_IMAGE_IF_NEEDED/') --region ${process.env.GCP_REGION || 'asia-southeast1'} --allow-unauthenticated`);
        res.json({
            ok: true,
            dataset: suffix,
            bucket: `${process.env.GCS_PROD_BUCKET || 'edenos-prod-assets'}-${suffix}`,
            service: `${process.env.CLOUD_RUN_SERVICE || 'edenos-mcp-bridge'}-${suffix}`
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
