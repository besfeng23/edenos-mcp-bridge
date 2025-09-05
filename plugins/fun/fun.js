"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.funRouter = void 0;
const express_1 = require("express");
const child_process_1 = require("child_process");
const web_api_1 = require("@slack/web-api");
const telegraf_1 = require("telegraf");
const crypto_1 = require("crypto");
const logging_1 = require("@google-cloud/logging");
const run_1 = require("@google-cloud/run");
const log_1 = require("./audit-cinema/log");
const router = (0, express_1.Router)();
const slack = process.env.SLACK_BOT_TOKEN ? new web_api_1.WebClient(process.env.SLACK_BOT_TOKEN) : null;
const tg = process.env.TELEGRAM_BOT_TOKEN ? new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN) : null;
const logging = new logging_1.Logging();
const runClient = new run_1.ServicesClient();
const ROASTS = [
    "Your deploy failed. Again. Consistency is key, I guess.",
    "I've seen shell scripts with more self-esteem.",
    "Try fewer typos, genius.",
    "Logs don't lie. You do."
];
function roast(msg) {
    if (slack)
        slack.chat.postMessage({ channel: process.env.SLACK_CHANNEL_ID, text: msg });
    if (tg)
        tg.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, msg);
}
async function deployEphemeral(service, image, ttlSec = 600) {
    const revTag = `ephemeral-${Date.now()}`;
    await exec(`gcloud run deploy ${service} --image ${image} --region ${process.env.GCP_REGION || 'asia-southeast1'} --project ${process.env.GCP_PROJECT_ID || 'agile-anagram-469914-e2'} --tag ${revTag} --no-traffic`);
    await exec(`gcloud run services update-traffic ${service} --region ${process.env.GCP_REGION || 'asia-southeast1'} --to-tags ${revTag}=100`);
    const approvalToken = (0, crypto_1.randomUUID)();
    liveApprovals.set(approvalToken, { service, revTag, deadline: Date.now() + ttlSec * 1000 });
    setTimeout(async () => {
        const pending = liveApprovals.get(approvalToken);
        if (!pending)
            return;
        await exec(`gcloud run services update-traffic ${service} --region ${process.env.GCP_REGION || 'asia-southeast1'} --to-latest`);
        roast(`Ephemeral deploy for ${service} auto-killed after ${ttlSec}s. Commitment issues? Understandable.`);
        liveApprovals.delete(approvalToken);
    }, ttlSec * 1000);
    return { approvalToken, revTag };
}
const liveApprovals = new Map();
function exec(cmd) {
    return new Promise((resolve, reject) => {
        const p = (0, child_process_1.spawn)(cmd, { shell: true, stdio: "inherit" });
        p.on("exit", code => code === 0 ? resolve() : reject(new Error(`cmd failed: ${cmd}`)));
    });
}
router.post("/deploy/ephemeral", async (req, res) => {
    const { service, image, ttlSec } = req.body;
    try {
        const out = await deployEphemeral(service || process.env.CLOUD_RUN_SERVICE || 'edenos-mcp-bridge', image, ttlSec || 600);
        await (0, log_1.audit)({ type: "deploy_ephemeral", actor: req.headers["x-actor-id"] || "unknown", meta: { service, image, ttlSec } });
        res.json({ ok: true, ...out });
    }
    catch (e) {
        roast(`Ephemeral deploy failed: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});
router.post("/deploy/approve", async (req, res) => {
    const { token } = req.body;
    const pending = liveApprovals.get(token);
    if (!pending)
        return res.status(404).json({ error: "nothing to approve" });
    liveApprovals.delete(token);
    roast(`Approved ephemeral deploy for ${pending.service}. Bold choice.`);
    await (0, log_1.audit)({ type: "deploy_approved", actor: req.headers["x-actor-id"] || "unknown", meta: { service: pending.service } });
    res.json({ ok: true });
});
router.post("/roast", (req, res) => {
    const msg = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    roast(msg);
    res.json({ ok: true, msg });
});
router.post("/hud/event", async (req, res) => {
    try {
        const entry = logging.log("edenos-hud").entry({}, req.body || {});
        await logging.log("edenos-hud").write(entry);
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.funRouter = router;
