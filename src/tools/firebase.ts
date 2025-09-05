import { z } from 'zod';

// Firebase MCP Server Integration
const FirebaseConfigSchema = z.object({
  projectId: z.string().min(1, 'Firebase project ID is required'),
  serviceAccountKey: z.string().optional(),
  apiKey: z.string().optional()
});

export class FirebaseMCPServer {
  private config: z.infer<typeof FirebaseConfigSchema>;
  private firestoreUrl: string;

  constructor(config: z.infer<typeof FirebaseConfigSchema>) {
    this.config = FirebaseConfigSchema.parse(config);
    this.firestoreUrl = `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/(default)/documents`;
  }

  async getDocument(collection: string, documentId: string) {
    try {
      const response = await fetch(`${this.firestoreUrl}/${collection}/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.serviceAccountKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Firebase API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: documentId,
        data: data.fields || {},
        createTime: data.createTime,
        updateTime: data.updateTime
      };
    } catch (error) {
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDocument(collection: string, documentId: string, data: Record<string, any>) {
    try {
      const fields = this.convertToFirestoreFields(data);
      
      const response = await fetch(`${this.firestoreUrl}/${collection}/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.serviceAccountKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        throw new Error(`Firebase API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        id: documentId,
        data: result.fields || {},
        createTime: result.createTime,
        updateTime: result.updateTime
      };
    } catch (error) {
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertToFirestoreFields(data: Record<string, any>): Record<string, any> {
    const fields: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      fields[key] = this.convertToFirestoreValue(value);
    }
    
    return fields;
  }

  private convertToFirestoreValue(value: any): any {
    if (value === null) return { nullValue: null };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') return { doubleValue: value };
    if (typeof value === 'string') return { stringValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(v => this.convertToFirestoreValue(v)) } };
    if (typeof value === 'object') return { mapValue: { fields: this.convertToFirestoreFields(value) } };
    
    return { stringValue: String(value) };
  }
}

export const firebaseTools = {
  'firebase.get-document': {
    description: 'Get a Firestore document',
    parameters: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        documentId: { type: 'string', description: 'Document ID' }
      },
      required: ['collection', 'documentId']
    }
  },
  'firebase.create-document': {
    description: 'Create a Firestore document',
    parameters: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        documentId: { type: 'string', description: 'Document ID' },
        data: { type: 'object', description: 'Document data' }
      },
      required: ['collection', 'documentId', 'data']
    }
  }
};

export async function executeFirebaseTool(tool: string, args: any, config: any) {
  const firebase = new FirebaseMCPServer(config);
  
  switch (tool) {
    case 'firebase.get-document':
      return await firebase.getDocument(args.collection, args.documentId);
    case 'firebase.create-document':
      return await firebase.createDocument(args.collection, args.documentId, args.data);
    default:
      throw new Error(`Unknown Firebase tool: ${tool}`);
  }
}