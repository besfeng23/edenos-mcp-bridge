import { z } from 'zod';

// Saviynt MCP Server Integration
// Provides tools for interacting with Saviynt identity governance platform

const SaviyntConfigSchema = z.object({
  apiKey: z.string().min(1, 'Saviynt API key is required'),
  baseUrl: z.string().default('https://api.saviynt.com/v1'),
  tenantId: z.string().min(1, 'Saviynt tenant ID is required')
});

const SaviyntUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.enum(['active', 'inactive', 'suspended']),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  lastLogin: z.string().optional(),
  createdDate: z.string(),
  modifiedDate: z.string()
});

const SaviyntRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  users: z.array(z.string()),
  status: z.enum(['active', 'inactive']),
  createdDate: z.string(),
  modifiedDate: z.string()
});

const SaviyntAccessRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  resourceId: z.string(),
  resourceName: z.string(),
  accessType: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  requestedDate: z.string(),
  approvedDate: z.string().optional(),
  approvedBy: z.string().optional(),
  justification: z.string().optional()
});

export class SaviyntMCPServer {
  private config: z.infer<typeof SaviyntConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof SaviyntConfigSchema>) {
    this.config = SaviyntConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.config.tenantId
    };
  }

  // Get user by ID
  async getUser(userId: string): Promise<z.infer<typeof SaviyntUserSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return SaviyntUserSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List users
  async listUsers(limit: number = 50, offset: number = 0, status?: string, role?: string) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      if (status) params.append('status', status);
      if (role) params.append('role', role);

      const response = await fetch(`${this.config.baseUrl}/users?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.users.map((user: any) => SaviyntUserSchema.parse(user));
    } catch (error) {
      throw new Error(`Failed to list users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create user
  async createUser(username: string, email: string, firstName: string, lastName: string, roles?: string[]) {
    try {
      const userData: any = {
        username,
        email,
        firstName,
        lastName,
        status: 'active'
      };
      if (roles) userData.roles = roles;

      const response = await fetch(`${this.config.baseUrl}/users`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return SaviyntUserSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update user
  async updateUser(userId: string, updates: { firstName?: string; lastName?: string; email?: string; status?: string; roles?: string[] }) {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return SaviyntUserSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete user
  async deleteUser(userId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, id: userId };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get role by ID
  async getRole(roleId: string): Promise<z.infer<typeof SaviyntRoleSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/roles/${roleId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return SaviyntRoleSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List roles
  async listRoles(limit: number = 50, offset: number = 0, status?: string) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      if (status) params.append('status', status);

      const response = await fetch(`${this.config.baseUrl}/roles?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.roles.map((role: any) => SaviyntRoleSchema.parse(role));
    } catch (error) {
      throw new Error(`Failed to list roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create role
  async createRole(name: string, description?: string, permissions?: string[]) {
    try {
      const roleData: any = { name, status: 'active' };
      if (description) roleData.description = description;
      if (permissions) roleData.permissions = permissions;

      const response = await fetch(`${this.config.baseUrl}/roles`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return SaviyntRoleSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to create role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Assign role to user
  async assignRole(userId: string, roleId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}/roles`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ roleId })
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to assign role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Remove role from user
  async removeRole(userId: string, roleId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, userId, roleId };
    } catch (error) {
      throw new Error(`Failed to remove role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get access requests
  async getAccessRequests(limit: number = 50, offset: number = 0, status?: string, userId?: string) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      if (status) params.append('status', status);
      if (userId) params.append('userId', userId);

      const response = await fetch(`${this.config.baseUrl}/access-requests?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.requests.map((request: any) => SaviyntAccessRequestSchema.parse(request));
    } catch (error) {
      throw new Error(`Failed to get access requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create access request
  async createAccessRequest(userId: string, resourceId: string, resourceName: string, accessType: string, justification?: string) {
    try {
      const requestData: any = {
        userId,
        resourceId,
        resourceName,
        accessType,
        status: 'pending'
      };
      if (justification) requestData.justification = justification;

      const response = await fetch(`${this.config.baseUrl}/access-requests`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return SaviyntAccessRequestSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to create access request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Approve access request
  async approveAccessRequest(requestId: string, approvedBy: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/access-requests/${requestId}/approve`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ approvedBy })
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to approve access request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Reject access request
  async rejectAccessRequest(requestId: string, rejectedBy: string, reason?: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/access-requests/${requestId}/reject`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ rejectedBy, reason })
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to reject access request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get audit logs
  async getAuditLogs(limit: number = 50, offset: number = 0, userId?: string, action?: string) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);

      const response = await fetch(`${this.config.baseUrl}/audit-logs?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Saviynt API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.logs;
    } catch (error) {
      throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Saviynt
export const saviyntTools = {
  'saviynt.get-user': {
    description: 'Get user by ID',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' }
      },
      required: ['userId']
    }
  },
  'saviynt.list-users': {
    description: 'List users',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' },
        status: { type: 'string', description: 'Filter by status' },
        role: { type: 'string', description: 'Filter by role' }
      }
    }
  },
  'saviynt.create-user': {
    description: 'Create user',
    parameters: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'Username' },
        email: { type: 'string', description: 'Email address' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        roles: { type: 'array', items: { type: 'string' }, description: 'User roles' }
      },
      required: ['username', 'email', 'firstName', 'lastName']
    }
  },
  'saviynt.update-user': {
    description: 'Update user',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        status: { type: 'string', description: 'User status' },
        roles: { type: 'array', items: { type: 'string' }, description: 'User roles' }
      },
      required: ['userId']
    }
  },
  'saviynt.delete-user': {
    description: 'Delete user',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' }
      },
      required: ['userId']
    }
  },
  'saviynt.get-role': {
    description: 'Get role by ID',
    parameters: {
      type: 'object',
      properties: {
        roleId: { type: 'string', description: 'Role ID' }
      },
      required: ['roleId']
    }
  },
  'saviynt.list-roles': {
    description: 'List roles',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' },
        status: { type: 'string', description: 'Filter by status' }
      }
    }
  },
  'saviynt.create-role': {
    description: 'Create role',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Role name' },
        description: { type: 'string', description: 'Role description' },
        permissions: { type: 'array', items: { type: 'string' }, description: 'Role permissions' }
      },
      required: ['name']
    }
  },
  'saviynt.assign-role': {
    description: 'Assign role to user',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        roleId: { type: 'string', description: 'Role ID' }
      },
      required: ['userId', 'roleId']
    }
  },
  'saviynt.remove-role': {
    description: 'Remove role from user',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        roleId: { type: 'string', description: 'Role ID' }
      },
      required: ['userId', 'roleId']
    }
  },
  'saviynt.get-access-requests': {
    description: 'Get access requests',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' },
        status: { type: 'string', description: 'Filter by status' },
        userId: { type: 'string', description: 'Filter by user ID' }
      }
    }
  },
  'saviynt.create-access-request': {
    description: 'Create access request',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        resourceId: { type: 'string', description: 'Resource ID' },
        resourceName: { type: 'string', description: 'Resource name' },
        accessType: { type: 'string', description: 'Access type' },
        justification: { type: 'string', description: 'Justification' }
      },
      required: ['userId', 'resourceId', 'resourceName', 'accessType']
    }
  },
  'saviynt.approve-access-request': {
    description: 'Approve access request',
    parameters: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'Request ID' },
        approvedBy: { type: 'string', description: 'Approver ID' }
      },
      required: ['requestId', 'approvedBy']
    }
  },
  'saviynt.reject-access-request': {
    description: 'Reject access request',
    parameters: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'Request ID' },
        rejectedBy: { type: 'string', description: 'Rejector ID' },
        reason: { type: 'string', description: 'Rejection reason' }
      },
      required: ['requestId', 'rejectedBy']
    }
  },
  'saviynt.get-audit-logs': {
    description: 'Get audit logs',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' },
        userId: { type: 'string', description: 'Filter by user ID' },
        action: { type: 'string', description: 'Filter by action' }
      }
    }
  }
};

// Tool execution handler
export async function executeSaviyntTool(tool: string, args: any, config: any) {
  const saviynt = new SaviyntMCPServer(config);
  
  switch (tool) {
    case 'saviynt.get-user':
      return await saviynt.getUser(args.userId);
    
    case 'saviynt.list-users':
      return await saviynt.listUsers(args.limit, args.offset, args.status, args.role);
    
    case 'saviynt.create-user':
      return await saviynt.createUser(args.username, args.email, args.firstName, args.lastName, args.roles);
    
    case 'saviynt.update-user':
      return await saviynt.updateUser(args.userId, args);
    
    case 'saviynt.delete-user':
      return await saviynt.deleteUser(args.userId);
    
    case 'saviynt.get-role':
      return await saviynt.getRole(args.roleId);
    
    case 'saviynt.list-roles':
      return await saviynt.listRoles(args.limit, args.offset, args.status);
    
    case 'saviynt.create-role':
      return await saviynt.createRole(args.name, args.description, args.permissions);
    
    case 'saviynt.assign-role':
      return await saviynt.assignRole(args.userId, args.roleId);
    
    case 'saviynt.remove-role':
      return await saviynt.removeRole(args.userId, args.roleId);
    
    case 'saviynt.get-access-requests':
      return await saviynt.getAccessRequests(args.limit, args.offset, args.status, args.userId);
    
    case 'saviynt.create-access-request':
      return await saviynt.createAccessRequest(args.userId, args.resourceId, args.resourceName, args.accessType, args.justification);
    
    case 'saviynt.approve-access-request':
      return await saviynt.approveAccessRequest(args.requestId, args.approvedBy);
    
    case 'saviynt.reject-access-request':
      return await saviynt.rejectAccessRequest(args.requestId, args.rejectedBy, args.reason);
    
    case 'saviynt.get-audit-logs':
      return await saviynt.getAuditLogs(args.limit, args.offset, args.userId, args.action);
    
    default:
      throw new Error(`Unknown Saviynt tool: ${tool}`);
  }
}
