"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chaos = exports.audit = exports.logCmd = exports.coolRouter = void 0;
exports.startCoolSockets = startCoolSockets;
exports.registerCoolMcp = registerCoolMcp;
const express_1 = require("express");
const stream_1 = require("./live-ops/stream");
const clone_env_1 = require("./clone-env");
const api_1 = require("./memgraph/api");
const spotify_1 = require("./mood/spotify");
const auto_1 = require("./doppel/auto");
Object.defineProperty(exports, "logCmd", { enumerable: true, get: function () { return auto_1.logCmd; } });
const rewind_1 = require("./rewind");
const killswitch_1 = require("./killswitch");
const log_1 = require("./audit-cinema/log");
Object.defineProperty(exports, "audit", { enumerable: true, get: function () { return log_1.audit; } });
const fun_1 = require("./fun");
const chaos_1 = require("./chaos");
Object.defineProperty(exports, "chaos", { enumerable: true, get: function () { return chaos_1.chaos; } });
exports.coolRouter = (0, express_1.Router)();
exports.coolRouter.use("/env", clone_env_1.cloneRouter);
exports.coolRouter.use("/memgraph", api_1.memgraphRouter);
exports.coolRouter.use("/mood", spotify_1.moodRouter);
exports.coolRouter.use("/auto", auto_1.doppelRouter);
exports.coolRouter.use("/rewind", rewind_1.rewindRouter);
exports.coolRouter.use("/kill", killswitch_1.killRouter);
exports.coolRouter.use("/audit", log_1.auditRouter);
exports.coolRouter.use("/fun", fun_1.funRouter);
exports.coolRouter.post("/chaos", (req, res) => {
    const { failPercent } = req.body;
    chaos_1.chaos.setFailureRate(typeof failPercent === "number" ? failPercent : 30);
    res.json({ ok: true, failPercent: chaos_1.chaos.getFailureRate() });
});
function startCoolSockets(app) {
    const server = app.listen ? app : app;
    (0, stream_1.startLiveOpsWS)(server);
}
function registerCoolMcp() {
    console.log("🎭 Fun MCP tools registered");
}
