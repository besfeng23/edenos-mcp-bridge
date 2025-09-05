"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLiveOpsWS = startLiveOpsWS;
const ws_1 = require("ws");
const child_process_1 = require("child_process");
function startLiveOpsWS(server) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on("upgrade", (req, socket, head) => {
        if (req.url?.startsWith("/cool/ws/live-ops")) {
            wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
        }
    });
    setInterval(async () => {
        try {
            const cmd = `gcloud run revisions list --region ${process.env.GCP_REGION || 'asia-southeast1'} --format=json`;
            const out = await sh(cmd);
            const events = JSON.parse(out).map((r) => ({
                type: "revision",
                service: r.service,
                name: r.name,
                traffic: r.traffic || 0,
                status: r.active ? "ACTIVE" : "INACTIVE",
                ts: Date.now()
            }));
            broadcast(wss, { type: "batch", events });
        }
        catch (error) {
            console.error("Live ops poll failed:", error);
        }
    }, 5000);
    return wss;
}
function broadcast(wss, msg) {
    wss.clients.forEach((c) => {
        if (c.readyState === 1) {
            c.send(JSON.stringify(msg));
        }
    });
}
function sh(cmd) {
    return new Promise((res, rej) => {
        const p = (0, child_process_1.spawn)(cmd, { shell: true });
        let s = "";
        p.stdout?.on("data", (d) => s += d);
        p.on("exit", (c) => c === 0 ? res(s) : rej(new Error("cmd failed")));
    });
}
