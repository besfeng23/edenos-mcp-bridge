import { z } from 'zod';

// Box MCP Server Integration
// Provides tools for interacting with Box file storage and collaboration platform

const BoxConfigSchema = z.object({
  accessToken: z.string().min(1, 'Box access token is required'),
  baseUrl: z.string().default('https://api.box.com/2.0'),
  clientId: z.string().optional(),
  clientSecret: z.string().optional()
});

const BoxFileSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  size: z.number().optional(),
  created_at: z.string(),
  modified_at: z.string(),
  content_created_at: z.string().optional(),
  content_modified_at: z.string().optional(),
  created_by: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    login: z.string()
  }),
  modified_by: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    login: z.string()
  }),
  owned_by: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    login: z.string()
  }),
  parent: z.object({
    type: z.string(),
    id: z.string(),
    sequence_id: z.string().optional(),
    etag: z.string().optional(),
    name: z.string()
  }).optional(),
  item_status: z.string().optional(),
  shared_link: z.object({
    url: z.string(),
    download_url: z.string().optional(),
    vanity_url: z.string().optional(),
    is_password_enabled: z.boolean(),
    password: z.string().optional(),
    unshared_at: z.string().optional(),
    download_count: z.number(),
    preview_count: z.number(),
    access: z.string(),
    effective_access: z.string(),
    effective_permission: z.string(),
    permissions: z.object({
      can_download: z.boolean(),
      can_preview: z.boolean()
    }),
    vanity_name: z.string().optional()
  }).optional(),
  path_collection: z.object({
    total_count: z.number(),
    entries: z.array(z.object({
      type: z.string(),
      id: z.string(),
      sequence_id: z.string().optional(),
      etag: z.string().optional(),
      name: z.string()
    }))
  }),
  version_number: z.string().optional(),
  comment_count: z.number().optional(),
  permissions: z.object({
    can_download: z.boolean(),
    can_upload: z.boolean(),
    can_rename: z.boolean(),
    can_delete: z.boolean(),
    can_share: z.boolean(),
    can_set_share_access: z.boolean(),
    can_preview: z.boolean(),
    can_comment: z.boolean(),
    can_annotate: z.boolean(),
    can_view_annotations_all: z.boolean(),
    can_view_annotations_self: z.boolean()
  }).optional()
});

const BoxFolderSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
  created_by: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    login: z.string()
  }),
  modified_by: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    login: z.string()
  }),
  owned_by: z.object({
    type: z.string(),
    id: z.string(),
    name: z.string(),
    login: z.string()
  }),
  parent: z.object({
    type: z.string(),
    id: z.string(),
    sequence_id: z.string().optional(),
    etag: z.string().optional(),
    name: z.string()
  }).optional(),
  item_status: z.string().optional(),
  shared_link: z.object({
    url: z.string(),
    download_url: z.string().optional(),
    vanity_url: z.string().optional(),
    is_password_enabled: z.boolean(),
    password: z.string().optional(),
    unshared_at: z.string().optional(),
    download_count: z.number(),
    preview_count: z.number(),
    access: z.string(),
    effective_access: z.string(),
    effective_permission: z.string(),
    permissions: z.object({
      can_download: z.boolean(),
      can_preview: z.boolean()
    }),
    vanity_name: z.string().optional()
  }).optional(),
  path_collection: z.object({
    total_count: z.number(),
    entries: z.array(z.object({
      type: z.string(),
      id: z.string(),
      sequence_id: z.string().optional(),
      etag: z.string().optional(),
      name: z.string()
    }))
  }),
  item_collection: z.object({
    total_count: z.number(),
    entries: z.array(z.any()),
    offset: z.number(),
    limit: z.number()
  }).optional(),
  permissions: z.object({
    can_download: z.boolean(),
    can_upload: z.boolean(),
    can_rename: z.boolean(),
    can_delete: z.boolean(),
    can_share: z.boolean(),
    can_set_share_access: z.boolean(),
    can_preview: z.boolean(),
    can_comment: z.boolean(),
    can_annotate: z.boolean(),
    can_view_annotations_all: z.boolean(),
    can_view_annotations_self: z.boolean()
  }).optional()
});

export class BoxMCPServer {
  private config: z.infer<typeof BoxConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof BoxConfigSchema>) {
    this.config = BoxConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Get file by ID
  async getFile(fileId: string, fields?: string[]): Promise<z.infer<typeof BoxFileSchema>> {
    try {
      const params = new URLSearchParams();
      if (fields) params.append('fields', fields.join(','));

      const response = await fetch(`${this.config.baseUrl}/files/${fileId}?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFileSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get folder by ID
  async getFolder(folderId: string, fields?: string[]): Promise<z.infer<typeof BoxFolderSchema>> {
    try {
      const params = new URLSearchParams();
      if (fields) params.append('fields', fields.join(','));

      const response = await fetch(`${this.config.baseUrl}/folders/${folderId}?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFolderSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List folder contents
  async listFolderContents(folderId: string, limit?: number, offset?: number, fields?: string[]) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      if (fields) params.append('fields', fields.join(','));

      const response = await fetch(`${this.config.baseUrl}/folders/${folderId}/items?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list folder contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create folder
  async createFolder(name: string, parentId: string = '0') {
    try {
      const response = await fetch(`${this.config.baseUrl}/folders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          name,
          parent: { id: parentId }
        })
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFolderSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update folder
  async updateFolder(folderId: string, updates: { name?: string; description?: string; tags?: string[] }) {
    try {
      const response = await fetch(`${this.config.baseUrl}/folders/${folderId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFolderSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to update folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete folder
  async deleteFolder(folderId: string, recursive: boolean = false) {
    try {
      const params = new URLSearchParams();
      if (recursive) params.append('recursive', 'true');

      const response = await fetch(`${this.config.baseUrl}/folders/${folderId}?${params}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, id: folderId };
    } catch (error) {
      throw new Error(`Failed to delete folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload file
  async uploadFile(fileName: string, fileContent: string, parentId: string = '0') {
    try {
      // First, create the file entry
      const createResponse = await fetch(`${this.config.baseUrl}/files/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
        body: JSON.stringify({
          name: fileName,
          parent: { id: parentId }
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Box API error: ${createResponse.status} ${createResponse.statusText}`);
      }

      const data = await createResponse.json();
      return BoxFileSchema.parse(data.entries[0]);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Download file
  async downloadFile(fileId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileId}/content`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update file
  async updateFile(fileId: string, updates: { name?: string; description?: string; tags?: string[] }) {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFileSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete file
  async deleteFile(fileId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, id: fileId };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Copy file
  async copyFile(fileId: string, parentId: string, name?: string) {
    try {
      const requestData: any = { parent: { id: parentId } };
      if (name) requestData.name = name;

      const response = await fetch(`${this.config.baseUrl}/files/${fileId}/copy`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFileSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Move file
  async moveFile(fileId: string, parentId: string, name?: string) {
    try {
      const requestData: any = { parent: { id: parentId } };
      if (name) requestData.name = name;

      const response = await fetch(`${this.config.baseUrl}/files/${fileId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BoxFileSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create shared link
  async createSharedLink(itemId: string, access: string = 'open', password?: string, expiresAt?: string) {
    try {
      const requestData: any = {
        shared_link: {
          access
        }
      };

      if (password) requestData.shared_link.password = password;
      if (expiresAt) requestData.shared_link.unshared_at = expiresAt;

      const response = await fetch(`${this.config.baseUrl}/files/${itemId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.shared_link;
    } catch (error) {
      throw new Error(`Failed to create shared link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search
  async search(query: string, limit?: number, offset?: number, fileExtensions?: string[], contentTypes?: string[]) {
    try {
      const params = new URLSearchParams({ q: query });
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      if (fileExtensions) params.append('file_extensions', fileExtensions.join(','));
      if (contentTypes) params.append('content_types', contentTypes.join(','));

      const response = await fetch(`${this.config.baseUrl}/search?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user information
  async getMe() {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/me`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get collaboration
  async getCollaboration(collaborationId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/collaborations/${collaborationId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get collaboration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create collaboration
  async createCollaboration(itemId: string, itemType: string, accessibleBy: { type: string; id?: string; login?: string }, role: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/collaborations`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          item: { type: itemType, id: itemId },
          accessible_by: accessibleBy,
          role
        })
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create collaboration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update collaboration
  async updateCollaboration(collaborationId: string, role: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/collaborations/${collaborationId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to update collaboration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete collaboration
  async deleteCollaboration(collaborationId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/collaborations/${collaborationId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Box API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, id: collaborationId };
    } catch (error) {
      throw new Error(`Failed to delete collaboration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Box
export const boxTools = {
  'box.get-file': {
    description: 'Get file by ID',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Fields to return' }
      },
      required: ['fileId']
    }
  },
  'box.get-folder': {
    description: 'Get folder by ID',
    parameters: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Folder ID' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Fields to return' }
      },
      required: ['folderId']
    }
  },
  'box.list-folder-contents': {
    description: 'List folder contents',
    parameters: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Folder ID' },
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Fields to return' }
      },
      required: ['folderId']
    }
  },
  'box.create-folder': {
    description: 'Create folder',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Folder name' },
        parentId: { type: 'string', description: 'Parent folder ID' }
      },
      required: ['name']
    }
  },
  'box.update-folder': {
    description: 'Update folder',
    parameters: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Folder ID' },
        name: { type: 'string', description: 'New folder name' },
        description: { type: 'string', description: 'Folder description' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Folder tags' }
      },
      required: ['folderId']
    }
  },
  'box.delete-folder': {
    description: 'Delete folder',
    parameters: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Folder ID' },
        recursive: { type: 'boolean', description: 'Delete recursively' }
      },
      required: ['folderId']
    }
  },
  'box.upload-file': {
    description: 'Upload file',
    parameters: {
      type: 'object',
      properties: {
        fileName: { type: 'string', description: 'File name' },
        fileContent: { type: 'string', description: 'File content' },
        parentId: { type: 'string', description: 'Parent folder ID' }
      },
      required: ['fileName', 'fileContent']
    }
  },
  'box.download-file': {
    description: 'Download file',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID' }
      },
      required: ['fileId']
    }
  },
  'box.update-file': {
    description: 'Update file',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID' },
        name: { type: 'string', description: 'New file name' },
        description: { type: 'string', description: 'File description' },
        tags: { type: 'array', items: { type: 'string' }, description: 'File tags' }
      },
      required: ['fileId']
    }
  },
  'box.delete-file': {
    description: 'Delete file',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID' }
      },
      required: ['fileId']
    }
  },
  'box.copy-file': {
    description: 'Copy file',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID' },
        parentId: { type: 'string', description: 'Destination folder ID' },
        name: { type: 'string', description: 'New file name' }
      },
      required: ['fileId', 'parentId']
    }
  },
  'box.move-file': {
    description: 'Move file',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID' },
        parentId: { type: 'string', description: 'Destination folder ID' },
        name: { type: 'string', description: 'New file name' }
      },
      required: ['fileId', 'parentId']
    }
  },
  'box.create-shared-link': {
    description: 'Create shared link',
    parameters: {
      type: 'object',
      properties: {
        itemId: { type: 'string', description: 'Item ID' },
        access: { type: 'string', description: 'Access level' },
        password: { type: 'string', description: 'Link password' },
        expiresAt: { type: 'string', description: 'Expiration date' }
      },
      required: ['itemId']
    }
  },
  'box.search': {
    description: 'Search files and folders',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' },
        fileExtensions: { type: 'array', items: { type: 'string' }, description: 'File extensions to filter' },
        contentTypes: { type: 'array', items: { type: 'string' }, description: 'Content types to filter' }
      },
      required: ['query']
    }
  },
  'box.get-me': {
    description: 'Get current user information',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'box.create-collaboration': {
    description: 'Create collaboration',
    parameters: {
      type: 'object',
      properties: {
        itemId: { type: 'string', description: 'Item ID' },
        itemType: { type: 'string', description: 'Item type' },
        accessibleBy: { type: 'object', description: 'User or group to collaborate with' },
        role: { type: 'string', description: 'Collaboration role' }
      },
      required: ['itemId', 'itemType', 'accessibleBy', 'role']
    }
  },
  'box.update-collaboration': {
    description: 'Update collaboration',
    parameters: {
      type: 'object',
      properties: {
        collaborationId: { type: 'string', description: 'Collaboration ID' },
        role: { type: 'string', description: 'New role' }
      },
      required: ['collaborationId', 'role']
    }
  },
  'box.delete-collaboration': {
    description: 'Delete collaboration',
    parameters: {
      type: 'object',
      properties: {
        collaborationId: { type: 'string', description: 'Collaboration ID' }
      },
      required: ['collaborationId']
    }
  }
};

// Tool execution handler
export async function executeBoxTool(tool: string, args: any, config: any) {
  const box = new BoxMCPServer(config);
  
  switch (tool) {
    case 'box.get-file':
      return await box.getFile(args.fileId, args.fields);
    
    case 'box.get-folder':
      return await box.getFolder(args.folderId, args.fields);
    
    case 'box.list-folder-contents':
      return await box.listFolderContents(args.folderId, args.limit, args.offset, args.fields);
    
    case 'box.create-folder':
      return await box.createFolder(args.name, args.parentId);
    
    case 'box.update-folder':
      return await box.updateFolder(args.folderId, args);
    
    case 'box.delete-folder':
      return await box.deleteFolder(args.folderId, args.recursive);
    
    case 'box.upload-file':
      return await box.uploadFile(args.fileName, args.fileContent, args.parentId);
    
    case 'box.download-file':
      return await box.downloadFile(args.fileId);
    
    case 'box.update-file':
      return await box.updateFile(args.fileId, args);
    
    case 'box.delete-file':
      return await box.deleteFile(args.fileId);
    
    case 'box.copy-file':
      return await box.copyFile(args.fileId, args.parentId, args.name);
    
    case 'box.move-file':
      return await box.moveFile(args.fileId, args.parentId, args.name);
    
    case 'box.create-shared-link':
      return await box.createSharedLink(args.itemId, args.access, args.password, args.expiresAt);
    
    case 'box.search':
      return await box.search(args.query, args.limit, args.offset, args.fileExtensions, args.contentTypes);
    
    case 'box.get-me':
      return await box.getMe();
    
    case 'box.create-collaboration':
      return await box.createCollaboration(args.itemId, args.itemType, args.accessibleBy, args.role);
    
    case 'box.update-collaboration':
      return await box.updateCollaboration(args.collaborationId, args.role);
    
    case 'box.delete-collaboration':
      return await box.deleteCollaboration(args.collaborationId);
    
    default:
      throw new Error(`Unknown Box tool: ${tool}`);
  }
}
