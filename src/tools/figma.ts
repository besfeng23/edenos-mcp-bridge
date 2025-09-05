import { z } from 'zod';

// Figma MCP Server Integration
// Provides tools for interacting with Figma files, components, and comments

const FigmaConfigSchema = z.object({
  accessToken: z.string().min(1, 'Figma access token is required'),
  baseUrl: z.string().default('https://api.figma.com/v1')
});

const FigmaFileSchema = z.object({
  key: z.string(),
  name: z.string(),
  lastModified: z.string(),
  thumbnailUrl: z.string().optional(),
  version: z.string(),
  role: z.string(),
  editorType: z.string(),
  linkAccess: z.string(),
  document: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    children: z.array(z.any()).optional()
  }).optional()
});

const FigmaComponentSchema = z.object({
  key: z.string(),
  file_key: z.string(),
  node_id: z.string(),
  thumbnail_url: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  user: z.object({
    id: z.string(),
    handle: z.string(),
    img_url: z.string()
  }),
  containing_frame: z.object({
    name: z.string(),
    node_id: z.string()
  }).optional()
});

const FigmaCommentSchema = z.object({
  id: z.string(),
  file_key: z.string(),
  parent_id: z.string().optional(),
  user: z.object({
    id: z.string(),
    handle: z.string(),
    img_url: z.string()
  }),
  created_at: z.string(),
  resolved_at: z.string().optional(),
  message: z.string(),
  client_meta: z.object({
    x: z.number(),
    y: z.number(),
    node_id: z.string(),
    node_offset: z.object({
      x: z.number(),
      y: z.number()
    }).optional()
  }),
  order_id: z.string()
});

export class FigmaMCPServer {
  private config: z.infer<typeof FigmaConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof FigmaConfigSchema>) {
    this.config = FigmaConfigSchema.parse(config);
    this.headers = {
      'X-Figma-Token': this.config.accessToken,
      'Content-Type': 'application/json'
    };
  }

  // Get file by key
  async getFile(fileKey: string, version?: string, ids?: string[], depth?: number, geometry?: string, plugin_data?: string): Promise<z.infer<typeof FigmaFileSchema>> {
    try {
      const params = new URLSearchParams();
      if (version) params.append('version', version);
      if (ids) params.append('ids', ids.join(','));
      if (depth) params.append('depth', depth.toString());
      if (geometry) params.append('geometry', geometry);
      if (plugin_data) params.append('plugin_data', plugin_data);

      const response = await fetch(`${this.config.baseUrl}/files/${fileKey}?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return FigmaFileSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file images
  async getFileImages(fileKey: string, ids: string[], format: 'jpg' | 'png' | 'svg' | 'pdf' = 'png', scale: number = 1, svg_include_id: boolean = false, svg_simplify_stroke: boolean = true) {
    try {
      const params = new URLSearchParams({
        ids: ids.join(','),
        format,
        scale: scale.toString(),
        svg_include_id: svg_include_id.toString(),
        svg_simplify_stroke: svg_simplify_stroke.toString()
      });

      const response = await fetch(`${this.config.baseUrl}/images/${fileKey}?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get file images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file comments
  async getFileComments(fileKey: string): Promise<z.infer<typeof FigmaCommentSchema>[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileKey}/comments`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.comments.map((comment: any) => FigmaCommentSchema.parse(comment));
    } catch (error) {
      throw new Error(`Failed to get file comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Post comment
  async postComment(fileKey: string, message: string, client_meta: { x: number; y: number; node_id: string; node_offset?: { x: number; y: number } }) {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileKey}/comments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          message,
          client_meta
        })
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to post comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get team projects
  async getTeamProjects(teamId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/teams/${teamId}/projects`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.projects;
    } catch (error) {
      throw new Error(`Failed to get team projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get project files
  async getProjectFiles(projectId: string, branch_data?: boolean) {
    try {
      const params = new URLSearchParams();
      if (branch_data) params.append('branch_data', branch_data.toString());

      const response = await fetch(`${this.config.baseUrl}/projects/${projectId}/files?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      throw new Error(`Failed to get project files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get team components
  async getTeamComponents(teamId: string, page_size?: number, after?: string) {
    try {
      const params = new URLSearchParams();
      if (page_size) params.append('page_size', page_size.toString());
      if (after) params.append('after', after);

      const response = await fetch(`${this.config.baseUrl}/teams/${teamId}/components?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.meta.components.map((component: any) => FigmaComponentSchema.parse(component));
    } catch (error) {
      throw new Error(`Failed to get team components: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file components
  async getFileComponents(fileKey: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileKey}/components`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.meta.components.map((component: any) => FigmaComponentSchema.parse(component));
    } catch (error) {
      throw new Error(`Failed to get file components: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get component set
  async getComponentSet(teamId: string, componentSetKey: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/teams/${teamId}/component_sets/${componentSetKey}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get component set: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get team styles
  async getTeamStyles(teamId: string, page_size?: number, after?: string) {
    try {
      const params = new URLSearchParams();
      if (page_size) params.append('page_size', page_size.toString());
      if (after) params.append('after', after);

      const response = await fetch(`${this.config.baseUrl}/teams/${teamId}/styles?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.meta.styles;
    } catch (error) {
      throw new Error(`Failed to get team styles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file styles
  async getFileStyles(fileKey: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/files/${fileKey}/styles`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.meta.styles;
    } catch (error) {
      throw new Error(`Failed to get file styles: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Figma
export const figmaTools = {
  'figma.get-file': {
    description: 'Get a Figma file by key',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        version: { type: 'string', description: 'File version' },
        ids: { type: 'array', items: { type: 'string' }, description: 'Node IDs to retrieve' },
        depth: { type: 'number', description: 'Depth of traversal' },
        geometry: { type: 'string', description: 'Geometry type' },
        plugin_data: { type: 'string', description: 'Plugin data' }
      },
      required: ['fileKey']
    }
  },
  'figma.get-file-images': {
    description: 'Get images from a Figma file',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        ids: { type: 'array', items: { type: 'string' }, description: 'Node IDs to export' },
        format: { type: 'string', enum: ['jpg', 'png', 'svg', 'pdf'], description: 'Image format' },
        scale: { type: 'number', description: 'Image scale' },
        svg_include_id: { type: 'boolean', description: 'Include ID in SVG' },
        svg_simplify_stroke: { type: 'boolean', description: 'Simplify SVG strokes' }
      },
      required: ['fileKey', 'ids']
    }
  },
  'figma.get-file-comments': {
    description: 'Get comments from a Figma file',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' }
      },
      required: ['fileKey']
    }
  },
  'figma.post-comment': {
    description: 'Post a comment to a Figma file',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        message: { type: 'string', description: 'Comment message' },
        client_meta: { type: 'object', description: 'Comment position metadata' }
      },
      required: ['fileKey', 'message', 'client_meta']
    }
  },
  'figma.get-team-projects': {
    description: 'Get projects from a Figma team',
    parameters: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Figma team ID' }
      },
      required: ['teamId']
    }
  },
  'figma.get-project-files': {
    description: 'Get files from a Figma project',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Figma project ID' },
        branch_data: { type: 'boolean', description: 'Include branch data' }
      },
      required: ['projectId']
    }
  },
  'figma.get-team-components': {
    description: 'Get components from a Figma team',
    parameters: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Figma team ID' },
        page_size: { type: 'number', description: 'Number of results per page' },
        after: { type: 'string', description: 'Cursor for pagination' }
      },
      required: ['teamId']
    }
  },
  'figma.get-file-components': {
    description: 'Get components from a Figma file',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' }
      },
      required: ['fileKey']
    }
  },
  'figma.get-component-set': {
    description: 'Get a component set from a Figma team',
    parameters: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Figma team ID' },
        componentSetKey: { type: 'string', description: 'Component set key' }
      },
      required: ['teamId', 'componentSetKey']
    }
  },
  'figma.get-team-styles': {
    description: 'Get styles from a Figma team',
    parameters: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Figma team ID' },
        page_size: { type: 'number', description: 'Number of results per page' },
        after: { type: 'string', description: 'Cursor for pagination' }
      },
      required: ['teamId']
    }
  },
  'figma.get-file-styles': {
    description: 'Get styles from a Figma file',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' }
      },
      required: ['fileKey']
    }
  },
  'figma.get-me': {
    description: 'Get current Figma user information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeFigmaTool(tool: string, args: any, config: any) {
  const figma = new FigmaMCPServer(config);
  
  switch (tool) {
    case 'figma.get-file':
      return await figma.getFile(args.fileKey, args.version, args.ids, args.depth, args.geometry, args.plugin_data);
    
    case 'figma.get-file-images':
      return await figma.getFileImages(args.fileKey, args.ids, args.format, args.scale, args.svg_include_id, args.svg_simplify_stroke);
    
    case 'figma.get-file-comments':
      return await figma.getFileComments(args.fileKey);
    
    case 'figma.post-comment':
      return await figma.postComment(args.fileKey, args.message, args.client_meta);
    
    case 'figma.get-team-projects':
      return await figma.getTeamProjects(args.teamId);
    
    case 'figma.get-project-files':
      return await figma.getProjectFiles(args.projectId, args.branch_data);
    
    case 'figma.get-team-components':
      return await figma.getTeamComponents(args.teamId, args.page_size, args.after);
    
    case 'figma.get-file-components':
      return await figma.getFileComponents(args.fileKey);
    
    case 'figma.get-component-set':
      return await figma.getComponentSet(args.teamId, args.componentSetKey);
    
    case 'figma.get-team-styles':
      return await figma.getTeamStyles(args.teamId, args.page_size, args.after);
    
    case 'figma.get-file-styles':
      return await figma.getFileStyles(args.fileKey);
    
    case 'figma.get-me':
      return await figma.getMe();
    
    default:
      throw new Error(`Unknown Figma tool: ${tool}`);
  }
}
