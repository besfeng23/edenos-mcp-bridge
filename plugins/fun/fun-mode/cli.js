#!/usr/bin/env node
const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));

function snark(msg) { 
  console.log(`[🤖] ${msg}`); 
}

async function post(path, body) {
  const bridgeUrl = process.env.BRIDGE_URL || 'http://localhost:8080';
  const token = process.env.BRIDGE_ADMIN_TOKEN;
  
  if (!token) {
    throw new Error('BRIDGE_ADMIN_TOKEN environment variable required');
  }
  
  const r = await fetch(`${bridgeUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body || {})
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`HTTP ${r.status}: ${errorText}`);
  }
  
  return r.json();
}

async function get(path) {
  const bridgeUrl = process.env.BRIDGE_URL || 'http://localhost:8080';
  const token = process.env.BRIDGE_ADMIN_TOKEN;
  
  if (!token) {
    throw new Error('BRIDGE_ADMIN_TOKEN environment variable required');
  }
  
  const r = await fetch(`${bridgeUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`HTTP ${r.status}: ${errorText}`);
  }
  
  return r.json();
}

(async () => {
  const [,, cmd, ...rest] = process.argv;
  
  if (!cmd) {
    console.log(`
🎭 EdenOS Fun Mode CLI

Usage: node cli.js <command> [args...]

Commands:
  clone <env>           Clone prod into sandbox environment
  kill                  Slam kill switch (sleep all services)
  wake [min]            Wake services with min instances
  auto                  Ask AI for command suggestions
  rewind [label]        Create snapshot of current state
  chaos [percent]       Set chaos failure rate (0-100)
  roast                 Send a random roast
  deploy <image>        Deploy ephemeral revision
  status                Show system status

Environment:
  BRIDGE_URL            Bridge service URL (default: http://localhost:8080)
  BRIDGE_ADMIN_TOKEN   Admin authentication token

Examples:
  node cli.js clone sandbox-joven
  node cli.js chaos 30
  node cli.js kill
  node cli.js wake 2
`);
    return;
  }
  
  try {
    switch (cmd) {
      case 'clone': {
        const to = rest[0] || "sandbox-fun";
        snark(`Cloning prod into ${to} because consequences are a tomorrow problem.`);
        const result = await post("/cool/env/clone", { toEnv: to });
        console.log("✅ Clone result:", result);
        break;
      }
      
      case 'kill': {
        snark("Slamming kill switch. If investors call, you were 'cost optimizing'.");
        const result = await post("/cool/kill/sleep", {});
        console.log("✅ Kill switch activated:", result);
        break;
      }
      
      case 'wake': {
        const min = parseInt(rest[0] || "1", 10);
        snark("Waking services. Coffee for servers.");
        const result = await post("/cool/kill/wake", { min });
        console.log("✅ Services awakened:", result);
        break;
      }
      
      case 'auto': {
        snark("Asking your lazier alter-ego for a plan...");
        const result = await post("/cool/auto/plan", {});
        console.log("🤖 AI Suggestions:");
        result.forEach((suggestion, i) => {
          console.log(`  ${i + 1}. ${suggestion.title}`);
          console.log(`     Command: ${suggestion.command}`);
          console.log(`     Reason: ${suggestion.reason}`);
          console.log("");
        });
        break;
      }
      
      case 'rewind': {
        const label = rest[0] || new Date().toISOString().replace(/[:.]/g, "-");
        snark("Snapshotting infra state for time travel.");
        const result = await post("/cool/rewind/snapshot", { label });
        console.log("✅ Snapshot created:", result);
        break;
      }
      
      case 'chaos': {
        const percent = parseInt(rest[0] || "30", 10);
        snark(`Setting chaos to ${percent}%. May the odds be ever in your favor.`);
        const result = await post("/cool/chaos", { failPercent: percent });
        console.log("🎲 Chaos level set:", result);
        break;
      }
      
      case 'roast': {
        snark("Sending roast to Slack/Telegram...");
        const result = await post("/fun/roast", {});
        console.log("🔥 Roast sent:", result.msg);
        break;
      }
      
      case 'deploy': {
        const image = rest[0];
        if (!image) {
          console.error("❌ Image required: deploy <image>");
          process.exit(1);
        }
        snark("Deploying ephemeral revision. This better work.");
        const result = await post("/fun/deploy/ephemeral", { image });
        console.log("🚀 Ephemeral deploy started:", result);
        console.log(`   Approval token: ${result.approvalToken}`);
        console.log(`   Auto-kill in: ${result.ttlSec || 600}s`);
        break;
      }
      
      case 'status': {
        snark("Checking system status...");
        try {
          const health = await get("/health");
          console.log("🏥 Health:", health.status);
          console.log("⏱️  Uptime:", Math.round(health.uptime / 60), "minutes");
          console.log("🛠️  Tools:", health.tools);
        } catch (error) {
          console.log("❌ Health check failed:", error.message);
        }
        break;
      }
      
      default:
        console.log(`❌ Unknown command: ${cmd}`);
        console.log("Run without args to see help");
        process.exit(1);
    }
  } catch (e) {
    snark("That exploded. Predictable.");
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
})();
