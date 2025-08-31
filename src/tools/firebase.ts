import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Firebase Hosting tools
const HostingDeploySchema = z.object({
  site: z.string(),
  channel: z.string().optional().default('live'),
  dryRun: z.boolean().optional().default(false),
});

const HostingStatusSchema = z.object({
  site: z.string(),
  channel: z.string().optional().default('live'),
});

const HostingRollbackSchema = z.object({
  site: z.string(),
  version: z.string(),
  dryRun: z.boolean().optional().default(false),
});

// Firebase Functions tools
const FunctionsDeploySchema = z.object({
  function: z.string().optional(),
  region: z.string().optional().default('asia-southeast1'),
  dryRun: z.boolean().optional().default(false),
});

const FunctionsStatusSchema = z.object({
  function: z.string().optional(),
  region: z.string().optional().default('asia-southeast1'),
});

// Firebase App tools
const AppConfigSchema = z.object({
  app: z.string(),
  dryRun: z.boolean().optional().default(false),
});

export const firebaseTools: Tool[] = [
  {
    name: 'firebase.hosting.deploy',
    description: 'Deploy Firebase Hosting site with optional channel',
    inputSchema: HostingDeploySchema,
  },
  {
    name: 'firebase.hosting.status',
    description: 'Get Firebase Hosting deployment status',
    inputSchema: HostingStatusSchema,
  },
  {
    name: 'firebase.hosting.rollback',
    description: 'Rollback Firebase Hosting to previous version',
    inputSchema: HostingRollbackSchema,
  },
  {
    name: 'firebase.functions.deploy',
    description: 'Deploy Firebase Functions',
    inputSchema: FunctionsDeploySchema,
  },
  {
    name: 'firebase.functions.status',
    description: 'Get Firebase Functions status',
    inputSchema: FunctionsStatusSchema,
  },
  {
    name: 'firebase.app.config',
    description: 'Get Firebase app configuration',
    inputSchema: AppConfigSchema,
  },
];

// Implementation functions
export async function executeHostingDeploy(args: z.infer<typeof HostingDeploySchema>) {
  const { site, channel, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would deploy hosting', site, channel };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const deployCmd = channel === 'live' 
      ? `firebase deploy --only hosting:${site}`
      : `firebase hosting:channel:deploy ${channel} --only hosting:${site}`;
    
    const { stdout } = await execAsync(deployCmd);
    
    return {
      success: true,
      site,
      channel,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Hosting deploy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeHostingStatus(args: z.infer<typeof HostingStatusSchema>) {
  const { site, channel } = args;
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync(
      `firebase hosting:sites:list --filter="name:${site}" --format=json`
    );
    
    const sites = JSON.parse(stdout);
    const siteInfo = sites.find((s: any) => s.name === site);
    
    if (!siteInfo) {
      throw new Error(`Site ${site} not found`);
    }
    
    return {
      name: siteInfo.name,
      defaultUrl: siteInfo.defaultUrl,
      appId: siteInfo.appId,
      status: siteInfo.status,
      channel: channel,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Hosting status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeHostingRollback(args: z.infer<typeof HostingRollbackSchema>) {
  const { site, version, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would rollback hosting', site, version };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync(
      `firebase hosting:releases:list --only hosting:${site} --format=json`
    );
    
    const releases = JSON.parse(stdout);
    const targetRelease = releases.find((r: any) => r.version === version);
    
    if (!targetRelease) {
      throw new Error(`Version ${version} not found`);
    }
    
    // Rollback to specific version
    const { stdout: rollbackOutput } = await execAsync(
      `firebase hosting:releases:rollback ${version} --only hosting:${site}`
    );
    
    return {
      success: true,
      site,
      version,
      output: rollbackOutput,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Hosting rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeFunctionsDeploy(args: z.infer<typeof FunctionsDeploySchema>) {
  const { function: funcName, region, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would deploy functions', function: funcName, region };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const deployCmd = funcName 
      ? `firebase deploy --only functions:${funcName}`
      : `firebase deploy --only functions`;
    
    const { stdout } = await execAsync(deployCmd);
    
    return {
      success: true,
      function: funcName || 'all',
      region,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Functions deploy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeFunctionsStatus(args: z.infer<typeof FunctionsStatusSchema>) {
  const { function: funcName, region } = args;
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync(
      `firebase functions:list --format=json`
    );
    
    const functions = JSON.parse(stdout);
    
    if (funcName) {
      const func = functions.find((f: any) => f.name === funcName);
      if (!func) {
        throw new Error(`Function ${funcName} not found`);
      }
      return func;
    }
    
    return {
      functions,
      count: functions.length,
      region,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Functions status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeAppConfig(args: z.infer<typeof AppConfigSchema>) {
  const { app, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would get app config', app };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync(
      `firebase apps:list --format=json`
    );
    
    const apps = JSON.parse(stdout);
    const appInfo = apps.find((a: any) => a.displayName === app || a.appId === app);
    
    if (!appInfo) {
      throw new Error(`App ${app} not found`);
    }
    
    return {
      appId: appInfo.appId,
      displayName: appInfo.displayName,
      platform: appInfo.platform,
      status: appInfo.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`App config retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
