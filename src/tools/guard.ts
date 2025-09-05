import { z } from "zod";

const HOURS = { start: 8, end: 22, tz: "Asia/Manila" };

export const guardConfig = z.object({
  rateRps: z.coerce.number().default(5),
  burst: z.coerce.number().default(10),
  allowedBranches: z.array(z.string()).default(["main","release/*"]),
});

export function ensureGuardrails({ branch, now=new Date() }: { branch: string; now?: Date; }) {
  const hour = new Intl.DateTimeFormat('en-PH',{hour:'2-digit',hour12:false,timeZone:HOURS.tz}).formatToParts(now).find(p=>p.type==='hour')!.value;
  const h = parseInt(hour,10);
  if (h < HOURS.start || h >= HOURS.end) throw new Error("Blocked by working-hours guardrail");
  if (!/^main$|^release\//.test(branch)) throw new Error(`Branch not allowed: ${branch}`);
}

// Enhanced guardrail checker with rate limiting
export function canRun(toolName: string, context: { hour: number; branch?: string }): boolean {
  try {
    // Working hours check
    if (context.hour < 8 || context.hour >= 22) {
      console.warn(`Tool ${toolName} blocked: outside working hours (${context.hour}:00)`);
      return false;
    }

    // Branch protection
    if (context.branch && !/^main$|^release\//.test(context.branch)) {
      console.warn(`Tool ${toolName} blocked: unsafe branch ${context.branch}`);
      return false;
    }

    // High-risk tool checks
    const highRiskTools = ['gcp.deploy', 'firebase.deploy', 'secrets.rotate', 'auth.admin'];
    if (highRiskTools.some(risk => toolName.includes(risk))) {
      if (context.hour < 9 || context.hour >= 17) {
        console.warn(`High-risk tool ${toolName} blocked: outside business hours`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`Guardrail check failed for ${toolName}:`, error);
    return false;
  }
}

