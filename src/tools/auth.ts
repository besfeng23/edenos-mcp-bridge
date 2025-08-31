import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Authentication tools
const LoginSchema = z.object({
  service: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const LogoutSchema = z.object({
  service: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const StatusSchema = z.object({
  service: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

const TokenSchema = z.object({
  service: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const ConfigSchema = z.object({
  service: z.string(),
  config: z.record(z.string()),
  dryRun: z.boolean().optional().default(false),
});

export const authTools: Tool[] = [
  {
    name: 'auth.login',
    description: 'Authenticate with specified service',
    inputSchema: LoginSchema,
  },
  {
    name: 'auth.logout',
    description: 'Logout from specified service',
    inputSchema: LogoutSchema,
  },
  {
    name: 'auth.status',
    description: 'Check authentication status',
    inputSchema: StatusSchema,
  },
  {
    name: 'auth.token',
    description: 'Get authentication token',
    inputSchema: TokenSchema,
  },
  {
    name: 'auth.config',
    description: 'Configure authentication settings',
    inputSchema: ConfigSchema,
  },
];

// Implementation functions
export async function executeLogin(args: z.infer<typeof LoginSchema>) {
  const { service, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would login', service };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    let loginCmd = '';
    
    switch (service.toLowerCase()) {
      case 'gcp':
      case 'google':
        loginCmd = 'gcloud auth login';
        break;
      case 'firebase':
        loginCmd = 'firebase login';
        break;
      case 'github':
        loginCmd = 'gh auth login';
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }
    
    const { stdout } = await execAsync(loginCmd);
    
    return {
      success: true,
      service,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeLogout(args: z.infer<typeof LogoutSchema>) {
  const { service, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would logout', service };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    let logoutCmd = '';
    
    switch (service.toLowerCase()) {
      case 'gcp':
      case 'google':
        logoutCmd = 'gcloud auth revoke';
        break;
      case 'firebase':
        logoutCmd = 'firebase logout';
        break;
      case 'github':
        logoutCmd = 'gh auth logout';
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }
    
    const { stdout } = await execAsync(logoutCmd);
    
    return {
      success: true,
      service,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeStatus(args: z.infer<typeof StatusSchema>) {
  const { service, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would check status', service };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    if (service) {
      // Check specific service
      let statusCmd = '';
      
      switch (service.toLowerCase()) {
        case 'gcp':
        case 'google':
          statusCmd = 'gcloud auth list --format=json';
          break;
        case 'firebase':
          statusCmd = 'firebase projects:list --format=json';
          break;
        case 'github':
          statusCmd = 'gh auth status --json';
          break;
        default:
          throw new Error(`Unsupported service: ${service}`);
      }
      
      const { stdout } = await execAsync(statusCmd);
      const status = JSON.parse(stdout);
      
      return {
        service,
        authenticated: true,
        status,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Check all services
      const results: any = {};
      
      try {
        const { stdout: gcpStatus } = await execAsync('gcloud auth list --format=json');
        results.gcp = { authenticated: true, status: JSON.parse(gcpStatus) };
      } catch (error) {
        results.gcp = { authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      try {
        const { stdout: firebaseStatus } = await execAsync('firebase projects:list --format=json');
        results.firebase = { authenticated: true, status: JSON.parse(firebaseStatus) };
      } catch (error) {
        results.firebase = { authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      try {
        const { stdout: githubStatus } = await execAsync('gh auth status --json');
        results.github = { authenticated: true, status: JSON.parse(githubStatus) };
      } catch (error) {
        results.github = { authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      return {
        services: results,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    throw new Error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeToken(args: z.infer<typeof TokenSchema>) {
  const { service, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would get token', service };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    let tokenCmd = '';
    
    switch (service.toLowerCase()) {
      case 'gcp':
      case 'google':
        tokenCmd = 'gcloud auth print-access-token';
        break;
      case 'firebase':
        tokenCmd = 'firebase login:ci --no-localhost';
        break;
      case 'github':
        tokenCmd = 'gh auth token';
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }
    
    const { stdout } = await execAsync(tokenCmd);
    
    return {
      success: true,
      service,
      token: stdout.trim(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Token retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeConfig(args: z.infer<typeof ConfigSchema>) {
  const { service, config, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would configure', service, config };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    let configCmd = '';
    
    switch (service.toLowerCase()) {
      case 'gcp':
      case 'google':
        if (config.project) {
          configCmd = `gcloud config set project ${config.project}`;
        } else if (config.account) {
          configCmd = `gcloud config set account ${config.account}`;
        } else if (config.region) {
          configCmd = `gcloud config set compute/region ${config.region}`;
        }
        break;
      case 'firebase':
        if (config.project) {
          configCmd = `firebase use ${config.project}`;
        }
        break;
      case 'github':
        if (config.host) {
          configCmd = `gh config set git_protocol https`;
        }
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }
    
    if (!configCmd) {
      throw new Error(`No valid configuration found for ${service}`);
    }
    
    const { stdout } = await execAsync(configCmd);
    
    return {
      success: true,
      service,
      config,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
