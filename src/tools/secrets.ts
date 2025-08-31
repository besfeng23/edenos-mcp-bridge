import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// GCP Secret Manager tools
const SecretCreateSchema = z.object({
  secret: z.string(),
  value: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const SecretGetSchema = z.object({
  secret: z.string(),
  version: z.string().optional().default('latest'),
  dryRun: z.boolean().optional().default(false),
});

const SecretUpdateSchema = z.object({
  secret: z.string(),
  value: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const SecretDeleteSchema = z.object({
  secret: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const SecretListSchema = z.object({
  filter: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

const SecretRotateSchema = z.object({
  secret: z.string(),
  dryRun: z.boolean().optional().default(false),
});

export const secretsTools: Tool[] = [
  {
    name: 'secrets.create',
    description: 'Create new secret in GCP Secret Manager',
    inputSchema: SecretCreateSchema,
  },
  {
    name: 'secrets.get',
    description: 'Get secret value from GCP Secret Manager',
    inputSchema: SecretGetSchema,
  },
  {
    name: 'secrets.update',
    description: 'Update secret value in GCP Secret Manager',
    inputSchema: SecretUpdateSchema,
  },
  {
    name: 'secrets.delete',
    description: 'Delete secret from GCP Secret Manager',
    inputSchema: SecretDeleteSchema,
  },
  {
    name: 'secrets.list',
    description: 'List secrets in GCP Secret Manager',
    inputSchema: SecretListSchema,
  },
  {
    name: 'secrets.rotate',
    description: 'Rotate secret in GCP Secret Manager',
    inputSchema: SecretRotateSchema,
  },
];

// Implementation functions
export async function executeSecretCreate(args: z.infer<typeof SecretCreateSchema>) {
  const { secret, value, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would create secret', secret, value: '[REDACTED]' };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Create secret
    const { stdout: createOutput } = await execAsync(
      `gcloud secrets create ${secret} --project=${projectId} --format=json`
    );
    
    // Add secret version
    const { stdout: versionOutput } = await execAsync(
      `echo -n "${value}" | gcloud secrets versions add ${secret} --data-file=- --project=${projectId} --format=json`
    );
    
    const versionInfo = JSON.parse(versionOutput);
    
    return {
      success: true,
      secret,
      version: versionInfo.name,
      project: projectId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Secret creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSecretGet(args: z.infer<typeof SecretGetSchema>) {
  const { secret, version, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would get secret', secret, version };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Get secret value
    const { stdout } = await execAsync(
      `gcloud secrets versions access ${version} --secret=${secret} --project=${projectId} --format=json`
    );
    
    return {
      success: true,
      secret,
      version,
      value: stdout.trim(),
      project: projectId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Secret retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSecretUpdate(args: z.infer<typeof SecretUpdateSchema>) {
  const { secret, value, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would update secret', secret, value: '[REDACTED]' };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Add new version
    const { stdout } = await execAsync(
      `echo -n "${value}" | gcloud secrets versions add ${secret} --data-file=- --project=${projectId} --format=json`
    );
    
    const versionInfo = JSON.parse(stdout);
    
    return {
      success: true,
      secret,
      version: versionInfo.name,
      project: projectId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Secret update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSecretDelete(args: z.infer<typeof SecretDeleteSchema>) {
  const { secret, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would delete secret', secret };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Delete secret
    const { stdout } = await execAsync(
      `gcloud secrets delete ${secret} --project=${projectId} --format=json`
    );
    
    return {
      success: true,
      secret,
      project: projectId,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Secret deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSecretList(args: z.infer<typeof SecretListSchema>) {
  const { filter, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would list secrets', filter };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    let listCmd = `gcloud secrets list --project=${projectId} --format=json`;
    if (filter) {
      listCmd += ` --filter="${filter}"`;
    }
    
    const { stdout } = await execAsync(listCmd);
    const secrets = JSON.parse(stdout);
    
    return {
      success: true,
      secrets: secrets.map((s: any) => ({
        name: s.name,
        createTime: s.createTime,
        labels: s.labels,
      })),
      count: secrets.length,
      project: projectId,
      filter,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Secret listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSecretRotate(args: z.infer<typeof SecretRotateSchema>) {
  const { secret, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would rotate secret', secret };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Generate new random value
    const newValue = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
    
    // Add new version
    const { stdout } = await execAsync(
      `echo -n "${newValue}" | gcloud secrets versions add ${secret} --data-file=- --project=${projectId} --format=json`
    );
    
    const versionInfo = JSON.parse(stdout);
    
    return {
      success: true,
      secret,
      version: versionInfo.name,
      project: projectId,
      message: 'Secret rotated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Secret rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
