import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Firestore Query tools
const QuerySchema = z.object({
  collection: z.string(),
  query: z.string().optional(),
  limit: z.number().optional().default(100),
  dryRun: z.boolean().optional().default(false),
});

const WriteSchema = z.object({
  collection: z.string(),
  document: z.string().optional(),
  data: z.record(z.any()),
  dryRun: z.boolean().optional().default(false),
});

const DeleteSchema = z.object({
  collection: z.string(),
  document: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const BackupSchema = z.object({
  collection: z.string(),
  destination: z.string(),
  dryRun: z.boolean().optional().default(false),
});

const RestoreSchema = z.object({
  source: z.string(),
  collection: z.string(),
  dryRun: z.boolean().optional().default(false),
});

export const firestoreTools: Tool[] = [
  {
    name: 'firestore.query',
    description: 'Query Firestore collection with optional filters',
    inputSchema: QuerySchema,
  },
  {
    name: 'firestore.write',
    description: 'Write document to Firestore collection',
    inputSchema: WriteSchema,
  },
  {
    name: 'firestore.delete',
    description: 'Delete document from Firestore collection',
    inputSchema: DeleteSchema,
  },
  {
    name: 'firestore.backup',
    description: 'Backup Firestore collection to GCS',
    inputSchema: BackupSchema,
  },
  {
    name: 'firestore.restore',
    description: 'Restore Firestore collection from GCS backup',
    inputSchema: RestoreSchema,
  },
];

// Implementation functions
export async function executeQuery(args: z.infer<typeof QuerySchema>) {
  const { collection, query, limit, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would query Firestore', collection, query, limit };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    let queryCmd = `gcloud firestore collections describe ${collection} --project=${projectId} --format=json`;
    
    if (query) {
      // For complex queries, we'd need to use the Firestore Admin SDK
      // For now, we'll use gcloud to get collection info
      queryCmd = `gcloud firestore collections describe ${collection} --project=${projectId} --format=json`;
    }
    
    const { stdout } = await execAsync(queryCmd);
    const collectionInfo = JSON.parse(stdout);
    
    return {
      collection: collectionInfo.name,
      documentCount: collectionInfo.documentCount || 'Unknown',
      query: query || 'all',
      limit,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Firestore query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeWrite(args: z.infer<typeof WriteSchema>) {
  const { collection, document, data, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would write to Firestore', collection, document, data };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    const docId = document || `doc_${Date.now()}`;
    
    // Create a temporary JSON file for the data
    const fs = await import('fs/promises');
    const tempFile = `/tmp/firestore_${docId}.json`;
    await fs.writeFile(tempFile, JSON.stringify(data));
    
    try {
      // Use gcloud to write the document
      const { stdout } = await execAsync(
        `gcloud firestore documents create ${collection}/${docId} --project=${projectId} --data-file=${tempFile} --format=json`
      );
      
      const result = JSON.parse(stdout);
      
      return {
        success: true,
        collection,
        document: docId,
        data,
        result,
        timestamp: new Date().toISOString(),
      };
    } finally {
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
    }
  } catch (error) {
    throw new Error(`Firestore write failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeDelete(args: z.infer<typeof DeleteSchema>) {
  const { collection, document, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would delete from Firestore', collection, document };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    const { stdout } = await execAsync(
      `gcloud firestore documents delete ${collection}/${document} --project=${projectId} --format=json`
    );
    
    return {
      success: true,
      collection,
      document,
      output: stdout,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Firestore delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeBackup(args: z.infer<typeof BackupSchema>) {
  const { collection, destination, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would backup Firestore', collection, destination };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Export collection to GCS
    const { stdout } = await execAsync(
      `gcloud firestore export gs://${destination} --collection-ids=${collection} --project=${projectId} --format=json`
    );
    
    const result = JSON.parse(stdout);
    
    return {
      success: true,
      collection,
      destination: `gs://${destination}`,
      operation: result.name,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Firestore backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeRestore(args: z.infer<typeof RestoreSchema>) {
  const { source, collection, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would restore Firestore', source, collection };
  }
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Import collection from GCS
    const { stdout } = await execAsync(
      `gcloud firestore import gs://${source} --collection-ids=${collection} --project=${projectId} --format=json`
    );
    
    const result = JSON.parse(stdout);
    
    return {
      success: true,
      source: `gs://${source}`,
      collection,
      operation: result.name,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Firestore restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
