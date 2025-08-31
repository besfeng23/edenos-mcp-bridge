import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// BigQuery Query tools
const QuerySchema = z.object({
  query: z.string(),
  dryRun: z.boolean().optional().default(false),
  maxResults: z.number().optional().default(1000),
});

const DatasetSchema = z.object({
  dataset: z.string(),
  project: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

const TableSchema = z.object({
  dataset: z.string(),
  table: z.string(),
  project: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

const ViewSchema = z.object({
  dataset: z.string(),
  view: z.string(),
  query: z.string(),
  project: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

const ExportSchema = z.object({
  dataset: z.string(),
  table: z.string(),
  destination: z.string(),
  format: z.enum(['CSV', 'JSON', 'AVRO', 'PARQUET']).optional().default('CSV'),
  project: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

export const bigqueryTools: Tool[] = [
  {
    name: 'bigquery.query',
    description: 'Execute BigQuery SQL query',
    inputSchema: QuerySchema,
  },
  {
    name: 'bigquery.dataset.create',
    description: 'Create BigQuery dataset',
    inputSchema: DatasetSchema,
  },
  {
    name: 'bigquery.table.create',
    description: 'Create BigQuery table',
    inputSchema: TableSchema,
  },
  {
    name: 'bigquery.view.create',
    description: 'Create BigQuery view',
    inputSchema: ViewSchema,
  },
  {
    name: 'bigquery.export',
    description: 'Export BigQuery table to GCS',
    inputSchema: ExportSchema,
  },
];

// Implementation functions
export async function executeQuery(args: z.infer<typeof QuerySchema>) {
  const { query, dryRun, maxResults } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would execute BigQuery query', query, maxResults };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Execute BigQuery query
    const { stdout } = await execAsync(
      `bq query --nouse_legacy_sql --max_rows=${maxResults} --format=json --project_id=${projectId} "${query}"`
    );
    
    const result = JSON.parse(stdout);
    
    return {
      success: true,
      query,
      results: result,
      rowCount: result.length,
      maxResults,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`BigQuery query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeDatasetCreate(args: z.infer<typeof DatasetSchema>) {
  const { dataset, project, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would create BigQuery dataset', dataset, project };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = project || process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Create dataset
    const { stdout } = await execAsync(
      `bq mk --dataset --project_id=${projectId} ${projectId}:${dataset}`
    );
    
    return {
      success: true,
      dataset,
      project: projectId,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`BigQuery dataset creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeTableCreate(args: z.infer<typeof TableSchema>) {
  const { dataset, table, project, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would create BigQuery table', dataset, table, project };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = project || process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Create table with basic schema
    const { stdout } = await execAsync(
      `bq mk --table --project_id=${projectId} ${projectId}:${dataset}.${table} "id:STRING,created_at:TIMESTAMP,data:STRING"`
    );
    
    return {
      success: true,
      dataset,
      table,
      project: projectId,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`BigQuery table creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeViewCreate(args: z.infer<typeof ViewSchema>) {
  const { dataset, view, query, project, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would create BigQuery view', dataset, view, query, project };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = project || process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Create view
    const { stdout } = await execAsync(
      `bq mk --view="${query}" --project_id=${projectId} ${projectId}:${dataset}.${view}`
    );
    
    return {
      success: true,
      dataset,
      view,
      query,
      project: projectId,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`BigQuery view creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeExport(args: z.infer<typeof ExportSchema>) {
  const { dataset, table, destination, format, project, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would export BigQuery table', dataset, table, destination, format, project };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = project || process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Export table to GCS
    const { stdout } = await execAsync(
      `bq extract --project_id=${projectId} --destination_format=${format} ${projectId}:${dataset}.${table} gs://${destination}`
    );
    
    return {
      success: true,
      dataset,
      table,
      destination: `gs://${destination}`,
      format,
      project: projectId,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`BigQuery export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
