import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// GitHub Actions tools
const WorkflowRunSchema = z.object({
  workflow: z.string(),
  ref: z.string().optional().default('main'),
  inputs: z.record(z.string()).optional(),
  dryRun: z.boolean().optional().default(false),
});

const WorkflowStatusSchema = z.object({
  workflow: z.string().optional(),
  ref: z.string().optional().default('main'),
});

const DeploymentSchema = z.object({
  environment: z.string(),
  ref: z.string().optional().default('main'),
  dryRun: z.boolean().optional().default(false),
});

const RollbackSchema = z.object({
  environment: z.string(),
  deployment: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const SmokeTestSchema = z.object({
  environment: z.string(),
  dryRun: z.boolean().optional().default(false),
});

export const actionsTools: Tool[] = [
  {
    name: 'actions.workflow.run',
    description: 'Trigger GitHub Actions workflow',
    inputSchema: WorkflowRunSchema,
  },
  {
    name: 'actions.workflow.status',
    description: 'Get GitHub Actions workflow status',
    inputSchema: WorkflowStatusSchema,
  },
  {
    name: 'actions.deploy',
    description: 'Deploy to specified environment',
    inputSchema: DeploymentSchema,
  },
  {
    name: 'actions.rollback',
    description: 'Rollback deployment to previous version',
    inputSchema: RollbackSchema,
  },
  {
    name: 'actions.smoke',
    description: 'Run smoke tests on environment',
    inputSchema: SmokeTestSchema,
  },
];

// Implementation functions
export async function executeWorkflowRun(args: z.infer<typeof WorkflowRunSchema>) {
  const { workflow, ref, inputs, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would trigger workflow', workflow, ref, inputs };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable required');
    }
    
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'edenos';
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'edenos-mcp-bridge';
    
    let inputParams = '';
    if (inputs && Object.keys(inputs).length > 0) {
      inputParams = Object.entries(inputs)
        .map(([key, value]) => `"${key}=${value}"`)
        .join(' ');
    }
    
    const { stdout } = await execAsync(
      `gh api repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches \
        -f ref=${ref} \
        -f inputs='${JSON.stringify(inputs || {})}' \
        --method POST \
        -H "Authorization: token ${token}" \
        -H "Accept: application/vnd.github.v3+json"`
    );
    
    return {
      success: true,
      workflow,
      ref,
      inputs,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Workflow trigger failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeWorkflowStatus(args: z.infer<typeof WorkflowStatusSchema>) {
  const { workflow, ref } = args;
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable required');
    }
    
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'edenos';
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'edenos-mcp-bridge';
    
    let apiUrl = `repos/${owner}/${repo}/actions/runs`;
    if (workflow) {
      apiUrl = `repos/${owner}/${repo}/actions/workflows/${workflow}/runs`;
    }
    
    const { stdout } = await execAsync(
      `gh api "${apiUrl}?branch=${ref}&per_page=5" \
        -H "Authorization: token ${token}" \
        -H "Accept: application/vnd.github.v3+json"`
    );
    
    const runs = JSON.parse(stdout);
    
    return {
      workflow: workflow || 'all',
      ref,
      runs: runs.workflow_runs || runs,
      count: (runs.workflow_runs || runs).length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Workflow status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeDeploy(args: z.infer<typeof DeploymentSchema>) {
  const { environment, ref, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would deploy', environment, ref };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Trigger deployment workflow
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable required');
    }
    
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'edenos';
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'edenos-mcp-bridge';
    
    const { stdout } = await execAsync(
      `gh api repos/${owner}/${repo}/actions/workflows/deploy.yml/dispatches \
        -f ref=${ref} \
        -f inputs='{"environment":"${environment}"}' \
        --method POST \
        -H "Authorization: token ${token}" \
        -H "Accept: application/vnd.github.v3+json"`
    );
    
    return {
      success: true,
      environment,
      ref,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeRollback(args: z.infer<typeof RollbackSchema>) {
  const { environment, deployment, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would rollback', environment, deployment };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Trigger rollback workflow
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable required');
    }
    
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'edenos';
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'edenos-mcp-bridge';
    
    const { stdout } = await execAsync(
      `gh api repos/${owner}/${repo}/actions/workflows/rollback.yml/dispatches \
        -f ref=main \
        -f inputs='{"environment":"${environment}","deployment":"${deployment}"}' \
        --method POST \
        -H "Authorization: token ${token}" \
        -H "Accept: application/vnd.github.v3+json"`
    );
    
    return {
      success: true,
      environment,
      deployment,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSmoke(args: z.infer<typeof SmokeTestSchema>) {
  const { environment, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would run smoke tests', environment };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Run smoke test workflow
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable required');
    }
    
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'edenos';
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'edenos-mcp-bridge';
    
    const { stdout } = await execAsync(
      `gh api repos/${owner}/${repo}/actions/workflows/smoke.yml/dispatches \
        -f ref=main \
        -f inputs='{"environment":"${environment}"}' \
        --method POST \
        -H "Authorization: token ${token}" \
        -H "Accept: application/vnd.github.v3+json"`
    );
    
    return {
      success: true,
      environment,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Smoke test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
