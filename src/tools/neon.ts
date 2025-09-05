import { z } from 'zod';

// Neon MCP Server Integration
// Provides tools for interacting with Neon serverless Postgres database

const NeonConfigSchema = z.object({
  apiKey: z.string().min(1, 'Neon API key is required'),
  baseUrl: z.string().default('https://console.neon.tech/api/v2'),
  projectId: z.string().min(1, 'Neon project ID is required')
});

const NeonDatabaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  host: z.string(),
  port: z.number(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  ssl: z.boolean(),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.string(),
  updated_at: z.string()
});

const NeonQueryResultSchema = z.object({
  rows: z.array(z.record(z.any())),
  rowCount: z.number(),
  command: z.string(),
  duration: z.number()
});

export class NeonMCPServer {
  private config: z.infer<typeof NeonConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof NeonConfigSchema>) {
    this.config = NeonConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Get project information
  async getProject() {
    try {
      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      throw new Error(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List databases
  async listDatabases(): Promise<z.infer<typeof NeonDatabaseSchema>[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/databases`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.databases.map((db: any) => NeonDatabaseSchema.parse(db));
    } catch (error) {
      throw new Error(`Failed to list databases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create database
  async createDatabase(name: string, owner?: string) {
    try {
      const dbData: any = { name };
      if (owner) dbData.owner = owner;

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/databases`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(dbData)
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return NeonDatabaseSchema.parse(data.database);
    } catch (error) {
      throw new Error(`Failed to create database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get database by name
  async getDatabase(name: string): Promise<z.infer<typeof NeonDatabaseSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/databases/${name}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return NeonDatabaseSchema.parse(data.database);
    } catch (error) {
      throw new Error(`Failed to get database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete database
  async deleteDatabase(name: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/databases/${name}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, name };
    } catch (error) {
      throw new Error(`Failed to delete database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Execute SQL query
  async executeQuery(query: string, database?: string): Promise<z.infer<typeof NeonQueryResultSchema>> {
    try {
      const queryData: any = { query };
      if (database) queryData.database = database;

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(queryData)
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return NeonQueryResultSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get table information
  async getTables(database?: string) {
    try {
      const params = new URLSearchParams();
      if (database) params.append('database', database);

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/tables?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.tables;
    } catch (error) {
      throw new Error(`Failed to get tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get table schema
  async getTableSchema(tableName: string, database?: string) {
    try {
      const params = new URLSearchParams();
      if (database) params.append('database', database);

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/tables/${tableName}/schema?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.schema;
    } catch (error) {
      throw new Error(`Failed to get table schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create table
  async createTable(tableName: string, schema: string, database?: string) {
    try {
      const tableData: any = {
        name: tableName,
        schema: schema
      };
      if (database) tableData.database = database;

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/tables`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(tableData)
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.table;
    } catch (error) {
      throw new Error(`Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Drop table
  async dropTable(tableName: string, database?: string) {
    try {
      const params = new URLSearchParams();
      if (database) params.append('database', database);

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/tables/${tableName}?${params}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, tableName };
    } catch (error) {
      throw new Error(`Failed to drop table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Insert data
  async insertData(tableName: string, data: Record<string, any>[], database?: string) {
    try {
      const insertData: any = {
        table: tableName,
        data: data
      };
      if (database) insertData.database = database;

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/insert`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(insertData)
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Failed to insert data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update data
  async updateData(tableName: string, data: Record<string, any>, where: Record<string, any>, database?: string) {
    try {
      const updateData: any = {
        table: tableName,
        data: data,
        where: where
      };
      if (database) updateData.database = database;

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/update`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Failed to update data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete data
  async deleteData(tableName: string, where: Record<string, any>, database?: string) {
    try {
      const deleteData: any = {
        table: tableName,
        where: where
      };
      if (database) deleteData.database = database;

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/delete`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(deleteData)
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Failed to delete data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get connection string
  async getConnectionString(database?: string) {
    try {
      const params = new URLSearchParams();
      if (database) params.append('database', database);

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/connection-string?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.connection_string;
    } catch (error) {
      throw new Error(`Failed to get connection string: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get usage statistics
  async getUsageStats(startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${this.config.baseUrl}/projects/${this.config.projectId}/usage?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Neon
export const neonTools = {
  'neon.get-project': {
    description: 'Get project information',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'neon.list-databases': {
    description: 'List databases',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'neon.create-database': {
    description: 'Create database',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Database name' },
        owner: { type: 'string', description: 'Database owner' }
      },
      required: ['name']
    }
  },
  'neon.get-database': {
    description: 'Get database by name',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Database name' }
      },
      required: ['name']
    }
  },
  'neon.delete-database': {
    description: 'Delete database',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Database name' }
      },
      required: ['name']
    }
  },
  'neon.execute-query': {
    description: 'Execute SQL query',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL query' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['query']
    }
  },
  'neon.get-tables': {
    description: 'Get table information',
    parameters: {
      type: 'object',
      properties: {
        database: { type: 'string', description: 'Database name' }
      }
    }
  },
  'neon.get-table-schema': {
    description: 'Get table schema',
    parameters: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName']
    }
  },
  'neon.create-table': {
    description: 'Create table',
    parameters: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        schema: { type: 'string', description: 'Table schema' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName', 'schema']
    }
  },
  'neon.drop-table': {
    description: 'Drop table',
    parameters: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName']
    }
  },
  'neon.insert-data': {
    description: 'Insert data',
    parameters: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        data: { type: 'array', items: { type: 'object' }, description: 'Data to insert' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName', 'data']
    }
  },
  'neon.update-data': {
    description: 'Update data',
    parameters: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        data: { type: 'object', description: 'Data to update' },
        where: { type: 'object', description: 'Where condition' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName', 'data', 'where']
    }
  },
  'neon.delete-data': {
    description: 'Delete data',
    parameters: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        where: { type: 'object', description: 'Where condition' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName', 'where']
    }
  },
  'neon.get-connection-string': {
    description: 'Get connection string',
    parameters: {
      type: 'object',
      properties: {
        database: { type: 'string', description: 'Database name' }
      }
    }
  },
  'neon.get-usage-stats': {
    description: 'Get usage statistics',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date' },
        endDate: { type: 'string', description: 'End date' }
      }
    }
  }
};

// Tool execution handler
export async function executeNeonTool(tool: string, args: any, config: any) {
  const neon = new NeonMCPServer(config);
  
  switch (tool) {
    case 'neon.get-project':
      return await neon.getProject();
    
    case 'neon.list-databases':
      return await neon.listDatabases();
    
    case 'neon.create-database':
      return await neon.createDatabase(args.name, args.owner);
    
    case 'neon.get-database':
      return await neon.getDatabase(args.name);
    
    case 'neon.delete-database':
      return await neon.deleteDatabase(args.name);
    
    case 'neon.execute-query':
      return await neon.executeQuery(args.query, args.database);
    
    case 'neon.get-tables':
      return await neon.getTables(args.database);
    
    case 'neon.get-table-schema':
      return await neon.getTableSchema(args.tableName, args.database);
    
    case 'neon.create-table':
      return await neon.createTable(args.tableName, args.schema, args.database);
    
    case 'neon.drop-table':
      return await neon.dropTable(args.tableName, args.database);
    
    case 'neon.insert-data':
      return await neon.insertData(args.tableName, args.data, args.database);
    
    case 'neon.update-data':
      return await neon.updateData(args.tableName, args.data, args.where, args.database);
    
    case 'neon.delete-data':
      return await neon.deleteData(args.tableName, args.where, args.database);
    
    case 'neon.get-connection-string':
      return await neon.getConnectionString(args.database);
    
    case 'neon.get-usage-stats':
      return await neon.getUsageStats(args.startDate, args.endDate);
    
    default:
      throw new Error(`Unknown Neon tool: ${tool}`);
  }
}
