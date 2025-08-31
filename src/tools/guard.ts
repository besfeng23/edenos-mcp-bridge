import { z } from 'zod';

const ContextSchema = z.object({
  hour: z.number().min(0).max(23),
  branch: z.string().optional(),
  dryRun: z.boolean().optional(),
});

export type GuardContext = z.infer<typeof ContextSchema>;

/**
 * Guardrail system to prevent dangerous operations
 * - Blocks deploys outside working hours (9 AM - 7 PM)
 * - Requires release branch for production deploys
 * - Always allows dry-run operations
 */
export const canRun = (tool: string, ctx: GuardContext): boolean => {
  // Always allow dry-run operations
  if (ctx.dryRun) return true;
  
  // Block dangerous operations outside working hours
  if (tool.includes('deploy') || tool.includes('restart') || tool.includes('delete')) {
    if (ctx.hour < 9 || ctx.hour > 19) {
      return false;
    }
  }
  
  // Require release branch for production deploys
  if (tool.includes('deploy') && !ctx.branch?.startsWith('release/')) {
    return false;
  }
  
  // Block destructive operations on production environment
  if (tool.includes('delete') && process.env.EDENOS_ENV === 'prod') {
    return false;
  }
  
  return true;
};

/**
 * Get guardrail status for a tool
 */
export const getGuardrailStatus = (tool: string, ctx: GuardContext) => {
  const allowed = canRun(tool, ctx);
  const reasons: string[] = [];
  
  if (!allowed) {
    if (tool.includes('deploy') && (ctx.hour < 9 || ctx.hour > 19)) {
      reasons.push('Outside working hours (9 AM - 7 PM)');
    }
    if (tool.includes('deploy') && !ctx.branch?.startsWith('release/')) {
      reasons.push('Requires release branch (release/*)');
    }
    if (tool.includes('delete') && process.env.EDENOS_ENV === 'prod') {
      reasons.push('Destructive operations blocked in production');
    }
  }
  
  return {
    allowed,
    reasons,
    context: ctx,
  };
};

