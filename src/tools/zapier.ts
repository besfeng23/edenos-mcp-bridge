import { z } from 'zod';

// Zapier MCP Server Integration
// Provides tools for interacting with Zapier zaps, triggers, and actions

const ZapierConfigSchema = z.object({
  apiKey: z.string().min(1, 'Zapier API key is required'),
  baseUrl: z.string().default('https://zapier.com/api/v1')
});

const ZapSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['on', 'off', 'draft']),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  trigger: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    app: z.object({
      id: z.number(),
      title: z.string(),
      description: z.string().optional(),
      hex_color: z.string().optional(),
      image: z.string().optional()
    })
  }),
  action: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    app: z.object({
      id: z.number(),
      title: z.string(),
      description: z.string().optional(),
      hex_color: z.string().optional(),
      image: z.string().optional()
    })
  })
});

export class ZapierMCPServer {
  private config: z.infer<typeof ZapierConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof ZapierConfigSchema>) {
    this.config = ZapierConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all zaps
  async getZaps(limit?: number, offset?: number): Promise<z.infer<typeof ZapSchema>[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await fetch(`${this.config.baseUrl}/zaps?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results.map((zap: any) => ZapSchema.parse(zap));
    } catch (error) {
      throw new Error(`Failed to get zaps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get zap by ID
  async getZap(zapId: number): Promise<z.infer<typeof ZapSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/zaps/${zapId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return ZapSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create zap
  async createZap(title: string, description?: string, triggerId?: number, actionId?: number) {
    try {
      const zapData: any = { title };
      if (description) zapData.description = description;
      if (triggerId) zapData.trigger = triggerId;
      if (actionId) zapData.action = actionId;

      const response = await fetch(`${this.config.baseUrl}/zaps`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(zapData)
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update zap
  async updateZap(zapId: number, title?: string, description?: string, status?: 'on' | 'off') {
    try {
      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (status) updateData.status = status;

      const response = await fetch(`${this.config.baseUrl}/zaps/${zapId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to update zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete zap
  async deleteZap(zapId: number) {
    try {
      const response = await fetch(`${this.config.baseUrl}/zaps/${zapId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, id: zapId };
    } catch (error) {
      throw new Error(`Failed to delete zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get zap runs
  async getZapRuns(zapId: number, limit?: number, offset?: number) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await fetch(`${this.config.baseUrl}/zaps/${zapId}/runs?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      throw new Error(`Failed to get zap runs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get available apps
  async getApps(limit?: number, offset?: number) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await fetch(`${this.config.baseUrl}/apps?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      throw new Error(`Failed to get apps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get app triggers
  async getAppTriggers(appId: number) {
    try {
      const response = await fetch(`${this.config.baseUrl}/apps/${appId}/triggers`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      throw new Error(`Failed to get app triggers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get app actions
  async getAppActions(appId: number) {
    try {
      const response = await fetch(`${this.config.baseUrl}/apps/${appId}/actions`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      throw new Error(`Failed to get app actions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get current user
  async getMe() {
    try {
      const response = await fetch(`${this.config.baseUrl}/me`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Zapier API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Zapier
export const zapierTools = {
  'zapier.get-zaps': {
    description: 'Get all Zapier zaps',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' }
      }
    }
  },
  'zapier.get-zap': {
    description: 'Get a Zapier zap by ID',
    parameters: {
      type: 'object',
      properties: {
        zapId: { type: 'number', description: 'Zap ID' }
      },
      required: ['zapId']
    }
  },
  'zapier.create-zap': {
    description: 'Create a new Zapier zap',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Zap title' },
        description: { type: 'string', description: 'Zap description' },
        triggerId: { type: 'number', description: 'Trigger ID' },
        actionId: { type: 'number', description: 'Action ID' }
      },
      required: ['title']
    }
  },
  'zapier.update-zap': {
    description: 'Update a Zapier zap',
    parameters: {
      type: 'object',
      properties: {
        zapId: { type: 'number', description: 'Zap ID' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        status: { type: 'string', enum: ['on', 'off'], description: 'New status' }
      },
      required: ['zapId']
    }
  },
  'zapier.delete-zap': {
    description: 'Delete a Zapier zap',
    parameters: {
      type: 'object',
      properties: {
        zapId: { type: 'number', description: 'Zap ID' }
      },
      required: ['zapId']
    }
  },
  'zapier.get-zap-runs': {
    description: 'Get runs for a Zapier zap',
    parameters: {
      type: 'object',
      properties: {
        zapId: { type: 'number', description: 'Zap ID' },
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' }
      },
      required: ['zapId']
    }
  },
  'zapier.get-apps': {
    description: 'Get available Zapier apps',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' }
      }
    }
  },
  'zapier.get-app-triggers': {
    description: 'Get triggers for a Zapier app',
    parameters: {
      type: 'object',
      properties: {
        appId: { type: 'number', description: 'App ID' }
      },
      required: ['appId']
    }
  },
  'zapier.get-app-actions': {
    description: 'Get actions for a Zapier app',
    parameters: {
      type: 'object',
      properties: {
        appId: { type: 'number', description: 'App ID' }
      },
      required: ['appId']
    }
  },
  'zapier.get-me': {
    description: 'Get current Zapier user information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeZapierTool(tool: string, args: any, config: any) {
  const zapier = new ZapierMCPServer(config);
  
  switch (tool) {
    case 'zapier.get-zaps':
      return await zapier.getZaps(args.limit, args.offset);
    
    case 'zapier.get-zap':
      return await zapier.getZap(args.zapId);
    
    case 'zapier.create-zap':
      return await zapier.createZap(args.title, args.description, args.triggerId, args.actionId);
    
    case 'zapier.update-zap':
      return await zapier.updateZap(args.zapId, args.title, args.description, args.status);
    
    case 'zapier.delete-zap':
      return await zapier.deleteZap(args.zapId);
    
    case 'zapier.get-zap-runs':
      return await zapier.getZapRuns(args.zapId, args.limit, args.offset);
    
    case 'zapier.get-apps':
      return await zapier.getApps(args.limit, args.offset);
    
    case 'zapier.get-app-triggers':
      return await zapier.getAppTriggers(args.appId);
    
    case 'zapier.get-app-actions':
      return await zapier.getAppActions(args.appId);
    
    case 'zapier.get-me':
      return await zapier.getMe();
    
    default:
      throw new Error(`Unknown Zapier tool: ${tool}`);
  }
}
