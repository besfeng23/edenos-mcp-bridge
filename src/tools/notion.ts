import { z } from 'zod';

// Notion MCP Server Integration
// Provides tools for interacting with Notion pages, databases, and blocks

const NotionConfigSchema = z.object({
  apiKey: z.string().min(1, 'Notion API key is required'),
  version: z.string().default('2022-06-28'),
  baseUrl: z.string().default('https://api.notion.com/v1')
});

const NotionPageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  url: z.string().optional(),
  created_time: z.string().optional(),
  last_edited_time: z.string().optional(),
  properties: z.record(z.any()).optional()
});

const NotionDatabaseSchema = z.object({
  id: z.string(),
  title: z.array(z.object({
    type: z.string(),
    text: z.object({
      content: z.string()
    })
  })).optional(),
  description: z.array(z.object({
    type: z.string(),
    text: z.object({
      content: z.string()
    })
  })).optional(),
  properties: z.record(z.any()).optional()
});

export class NotionMCPServer {
  private config: z.infer<typeof NotionConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof NotionConfigSchema>) {
    this.config = NotionConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Notion-Version': this.config.version,
      'Content-Type': 'application/json'
    };
  }

  // Get page by ID
  async getPage(pageId: string): Promise<z.infer<typeof NotionPageSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/pages/${pageId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return NotionPageSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get database by ID
  async getDatabase(databaseId: string): Promise<z.infer<typeof NotionDatabaseSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/databases/${databaseId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return NotionDatabaseSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Query database
  async queryDatabase(databaseId: string, filter?: any, sorts?: any[], pageSize?: number) {
    try {
      const body: any = {};
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      if (pageSize) body.page_size = pageSize;

      const response = await fetch(`${this.config.baseUrl}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to query database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create page
  async createPage(parent: { database_id?: string; page_id?: string }, properties: Record<string, any>) {
    try {
      const body = {
        parent,
        properties
      };

      const response = await fetch(`${this.config.baseUrl}/pages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update page
  async updatePage(pageId: string, properties: Record<string, any>) {
    try {
      const body = { properties };

      const response = await fetch(`${this.config.baseUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to update page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get page content (blocks)
  async getPageContent(pageId: string, pageSize?: number) {
    try {
      const url = new URL(`${this.config.baseUrl}/blocks/${pageId}/children`);
      if (pageSize) url.searchParams.set('page_size', pageSize.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get page content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search
  async search(query: string, filter?: { value: string; property: string }, pageSize?: number) {
    try {
      const body: any = { query };
      if (filter) body.filter = filter;
      if (pageSize) body.page_size = pageSize;

      const response = await fetch(`${this.config.baseUrl}/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user info
  async getMe() {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/me`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Notion
export const notionTools = {
  'notion.get-page': {
    description: 'Get a Notion page by ID',
    parameters: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: 'The ID of the page to retrieve'
        }
      },
      required: ['pageId']
    }
  },
  'notion.get-database': {
    description: 'Get a Notion database by ID',
    parameters: {
      type: 'object',
      properties: {
        databaseId: {
          type: 'string',
          description: 'The ID of the database to retrieve'
        }
      },
      required: ['databaseId']
    }
  },
  'notion.query-database': {
    description: 'Query a Notion database with filters and sorts',
    parameters: {
      type: 'object',
      properties: {
        databaseId: {
          type: 'string',
          description: 'The ID of the database to query'
        },
        filter: {
          type: 'object',
          description: 'Filter criteria for the query'
        },
        sorts: {
          type: 'array',
          description: 'Sort criteria for the query'
        },
        pageSize: {
          type: 'number',
          description: 'Number of results to return'
        }
      },
      required: ['databaseId']
    }
  },
  'notion.create-page': {
    description: 'Create a new Notion page',
    parameters: {
      type: 'object',
      properties: {
        parent: {
          type: 'object',
          description: 'Parent database or page ID',
          properties: {
            database_id: { type: 'string' },
            page_id: { type: 'string' }
          }
        },
        properties: {
          type: 'object',
          description: 'Properties for the new page'
        }
      },
      required: ['parent', 'properties']
    }
  },
  'notion.update-page': {
    description: 'Update an existing Notion page',
    parameters: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: 'The ID of the page to update'
        },
        properties: {
          type: 'object',
          description: 'Properties to update'
        }
      },
      required: ['pageId', 'properties']
    }
  },
  'notion.get-page-content': {
    description: 'Get the content (blocks) of a Notion page',
    parameters: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: 'The ID of the page to get content from'
        },
        pageSize: {
          type: 'number',
          description: 'Number of blocks to return'
        }
      },
      required: ['pageId']
    }
  },
  'notion.search': {
    description: 'Search across Notion pages and databases',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        filter: {
          type: 'object',
          description: 'Filter criteria for the search'
        },
        pageSize: {
          type: 'number',
          description: 'Number of results to return'
        }
      },
      required: ['query']
    }
  },
  'notion.get-me': {
    description: 'Get current user information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeNotionTool(tool: string, args: any, config: any) {
  const notion = new NotionMCPServer(config);
  
  switch (tool) {
    case 'notion.get-page':
      return await notion.getPage(args.pageId);
    
    case 'notion.get-database':
      return await notion.getDatabase(args.databaseId);
    
    case 'notion.query-database':
      return await notion.queryDatabase(args.databaseId, args.filter, args.sorts, args.pageSize);
    
    case 'notion.create-page':
      return await notion.createPage(args.parent, args.properties);
    
    case 'notion.update-page':
      return await notion.updatePage(args.pageId, args.properties);
    
    case 'notion.get-page-content':
      return await notion.getPageContent(args.pageId, args.pageSize);
    
    case 'notion.search':
      return await notion.search(args.query, args.filter, args.pageSize);
    
    case 'notion.get-me':
      return await notion.getMe();
    
    default:
      throw new Error(`Unknown Notion tool: ${tool}`);
  }
}
