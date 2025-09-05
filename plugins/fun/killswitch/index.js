"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killRouter = void 0;
const express_1 = require("express");
const child_process_1 = require("child_process");
exports.killRouter = (0, express_1.Router)();
exports.killRouter.post("/sleep", async (req, res) => {
    const pattern = req.body.pattern || "edenos-*";
    try {
        await sh(`for s in $(gcloud run services list --region ${process.env.GCP_REGION || 'asia-southeast1'} --format='value(name)' | grep -E '${pattern}'); do gcloud run services update $s --region ${process.env.GCP_REGION || 'asia-southeast1'} --min-instances 0; done`);
        await sh(`for j in $(gcloud scheduler jobs list --location ${process.env.GCP_REGION || 'asia-southeast1'} --format='value(name)'); do gcloud scheduler jobs pause $j --location ${process.env.GCP_REGION || 'asia-southeast1'}; done`);
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.killRouter.post("/wake", async (req, res) => {
    const min = req.body.min || 1;
    try {
        await sh(`for s in $(gcloud run services list --region ${process.env.GCP_REGION || 'asia-southeast1'} --format='value(name)'); do gcloud run services update $s --region ${process.env.GCP_REGION || 'asia-southeast1'} --min-instances ${min}; done`);
        await sh(`for j in $(gcloud scheduler jobs list --location ${process.env.GCP_REGION || 'asia-southeast1'} --format='value(name)'); do gcloud scheduler jobs resume $j --location ${process.env.GCP_REGION || 'asia-southeast1'}; done`);
        res.json({ ok: true });
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
