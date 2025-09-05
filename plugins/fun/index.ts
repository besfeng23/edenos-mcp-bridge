import { Router } from "express";
import { startLiveOpsWS } from "./live-ops/stream";
import { cloneRouter } from "./clone-env";
import { memgraphRouter } from "./memgraph/api";
import { moodRouter } from "./mood/spotify";
import { doppelRouter, logCmd } from "./doppel/auto";
import { rewindRouter } from "./rewind";
import { killRouter } from "./killswitch";
import { auditRouter, audit } from "./audit-cinema/log";
import { funRouter } from "./fun";
import { chaos } from "./chaos";

export const coolRouter = Router();

// Mount all fun routes
coolRouter.use("/env", cloneRouter);
coolRouter.use("/memgraph", memgraphRouter);
coolRouter.use("/mood", moodRouter);
coolRouter.use("/auto", doppelRouter);
coolRouter.use("/rewind", rewindRouter);
coolRouter.use("/kill", killRouter);
coolRouter.use("/audit", auditRouter);
coolRouter.use("/fun", funRouter);

// Chaos monkey endpoint
coolRouter.post("/chaos", (req, res) => {
  const { failPercent } = req.body;
  chaos.setFailureRate(typeof failPercent === "number" ? failPercent : 30);
  res.json({ ok: true, failPercent: chaos.getFailureRate() });
});

// Expose functions for external use
export { startCoolSockets, registerCoolMcp, logCmd, audit, chaos };

export function startCoolSockets(app: any) {
  const server = app.listen ? app : (app as any);
  startLiveOpsWS(server);
}

export function registerCoolMcp(/* mcp */) {
  // Register MCP tools to your MCP server instance
  // This will be called from your main server.ts
  console.log("🎭 Fun MCP tools registered");
}
