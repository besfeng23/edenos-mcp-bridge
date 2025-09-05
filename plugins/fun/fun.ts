import { Router } from "express";
import { spawn } from "child_process";
import { WebClient } from "@slack/web-api";
import { Telegraf } from "telegraf";
import { randomUUID } from "crypto";
import { Logging } from "@google-cloud/logging";
import { ServicesClient } from "@google-cloud/run";
import { audit } from "./audit-cinema/log";

const router = Router();
const slack = process.env.SLACK_BOT_TOKEN ? new WebClient(process.env.SLACK_BOT_TOKEN) : null;
const tg = process.env.TELEGRAM_BOT_TOKEN ? new Telegraf(process.env.TELEGRAM_BOT_TOKEN) : null;
const logging = new Logging();
const runClient = new ServicesClient();

const ROASTS = [
  "Your deploy failed. Again. Consistency is key, I guess.",
  "I've seen shell scripts with more self-esteem.",
  "Try fewer typos, genius.",
  "Logs don't lie. You do."
];

function roast(msg: string) {
  if (slack) slack.chat.postMessage({ channel: process.env.SLACK_CHANNEL_ID!, text: msg });
  if (tg) tg.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID!, msg);
}

async function deployEphemeral(service: string, image: string, ttlSec = 600) {
  // Create a new revision with a unique tag and an approval gate stored in memory
  const revTag = `ephemeral-${Date.now()}`;
  
  // Use gcloud for simplicity; Cloud Run Admin API calls are verbose
  await exec(`gcloud run deploy ${service} --image ${image} --region ${process.env.GCP_REGION || 'asia-southeast1'} --project ${process.env.GCP_PROJECT_ID || 'agile-anagram-469914-e2'} --tag ${revTag} --no-traffic`);
  await exec(`gcloud run services update-traffic ${service} --region ${process.env.GCP_REGION || 'asia-southeast1'} --to-tags ${revTag}=100`);

  const approvalToken = randomUUID();
  liveApprovals.set(approvalToken, { service, revTag, deadline: Date.now() + ttlSec * 1000 });

  setTimeout(async () => {
    const pending = liveApprovals.get(approvalToken);
    if (!pending) return; // approved
    
    // Rollback: move all traffic back to 'latest' (or stable tag), then yank temp tag
    await exec(`gcloud run services update-traffic ${service} --region ${process.env.GCP_REGION || 'asia-southeast1'} --to-latest`);
    roast(`Ephemeral deploy for ${service} auto-killed after ${ttlSec}s. Commitment issues? Understandable.`);
    liveApprovals.delete(approvalToken);
  }, ttlSec * 1000);

  return { approvalToken, revTag };
}

const liveApprovals = new Map<string, { service: string; revTag: string; deadline: number }>();

function exec(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, { shell: true, stdio: "inherit" });
    p.on("exit", code => code === 0 ? resolve() : reject(new Error(`cmd failed: ${cmd}`)));
  });
}

router.post("/deploy/ephemeral", async (req, res) => {
  const { service, image, ttlSec } = req.body;
  try {
    const out = await deployEphemeral(service || process.env.CLOUD_RUN_SERVICE || 'edenos-mcp-bridge', image, ttlSec || 600);
    await audit({ type: "deploy_ephemeral", actor: req.headers["x-actor-id"] as string || "unknown", meta: { service, image, ttlSec } });
    res.json({ ok: true, ...out });
  } catch (e: any) {
    roast(`Ephemeral deploy failed: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

router.post("/deploy/approve", async (req, res) => {
  const { token } = req.body;
  const pending = liveApprovals.get(token);
  if (!pending) return res.status(404).json({ error: "nothing to approve" });
  
  liveApprovals.delete(token);
  roast(`Approved ephemeral deploy for ${pending.service}. Bold choice.`);
  await audit({ type: "deploy_approved", actor: req.headers["x-actor-id"] as string || "unknown", meta: { service: pending.service } });
  res.json({ ok: true });
});

// Roast test
router.post("/roast", (req, res) => {
  const msg = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  roast(msg);
  res.json({ ok: true, msg });
});

// HUD telemetry inlet (your app posts here)
router.post("/hud/event", async (req, res) => {
  try {
    const entry = logging.log("edenos-hud").entry({}, req.body || {});
    await logging.log("edenos-hud").write(entry);
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const funRouter = router;
