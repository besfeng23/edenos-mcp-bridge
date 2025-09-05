import { z } from 'zod';

// Linear MCP Server Integration
// Provides tools for interacting with Linear issues, projects, and teams

const LinearConfigSchema = z.object({
  apiKey: z.string().min(1, 'Linear API key is required'),
  baseUrl: z.string().default('https://api.linear.app/graphql')
});

const LinearIssueSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  title: z.string(),
  description: z.string().optional(),
  state: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string()
  }).optional(),
  priority: z.number().optional(),
  assignee: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string()
  }).optional(),
  team: z.object({
    id: z.string(),
    name: z.string(),
    key: z.string()
  }).optional(),
  project: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  url: z.string().optional()
});

const LinearProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  state: z.string().optional(),
  progress: z.number().optional(),
  targetDate: z.string().optional(),
  team: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const LinearTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  description: z.string().optional(),
  members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string()
  })).optional()
});

export class LinearMCPServer {
  private config: z.infer<typeof LinearConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof LinearConfigSchema>) {
    this.config = LinearConfigSchema.parse(config);
    this.headers = {
      'Authorization': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  // GraphQL query helper
  private async graphqlQuery(query: string, variables?: Record<string, any>) {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables: variables || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Linear GraphQL error: ${JSON.stringify(data.errors)}`);
      }

      return data.data;
    } catch (error) {
      throw new Error(`GraphQL query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get issue by ID
  async getIssue(issueId: string): Promise<z.infer<typeof LinearIssueSchema>> {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          state {
            id
            name
            type
          }
          priority
          assignee {
            id
            name
            email
          }
          team {
            id
            name
            key
          }
          project {
            id
            name
          }
          createdAt
          updatedAt
          url
        }
      }
    `;

    const data = await this.graphqlQuery(query, { id: issueId });
    return LinearIssueSchema.parse(data.issue);
  }

  // Get issues by team
  async getIssues(teamId?: string, state?: string, assigneeId?: string, limit?: number) {
    const query = `
      query GetIssues($teamId: String, $state: String, $assigneeId: String, $limit: Int) {
        issues(
          filter: {
            team: { id: { eq: $teamId } }
            state: { name: { eq: $state } }
            assignee: { id: { eq: $assigneeId } }
          }
          first: $limit
        ) {
          nodes {
            id
            identifier
            title
            description
            state {
              id
              name
              type
            }
            priority
            assignee {
              id
              name
              email
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const data = await this.graphqlQuery(query, { teamId, state, assigneeId, limit });
    return data.issues.nodes;
  }

  // Create issue
  async createIssue(input: {
    teamId: string;
    title: string;
    description?: string;
    stateId?: string;
    assigneeId?: string;
    projectId?: string;
    priority?: number;
  }) {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
              type
            }
            priority
            assignee {
              id
              name
              email
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const data = await this.graphqlQuery(mutation, { input });
    return data.issueCreate;
  }

  // Update issue
  async updateIssue(issueId: string, input: {
    title?: string;
    description?: string;
    stateId?: string;
    assigneeId?: string;
    projectId?: string;
    priority?: number;
  }) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
              type
            }
            priority
            assignee {
              id
              name
              email
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const data = await this.graphqlQuery(mutation, { id: issueId, input });
    return data.issueUpdate;
  }

  // Get project by ID
  async getProject(projectId: string): Promise<z.infer<typeof LinearProjectSchema>> {
    const query = `
      query GetProject($id: String!) {
        project(id: $id) {
          id
          name
          description
          state
          progress
          targetDate
          team {
            id
            name
          }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.graphqlQuery(query, { id: projectId });
    return LinearProjectSchema.parse(data.project);
  }

  // Get projects by team
  async getProjects(teamId?: string, state?: string, limit?: number) {
    const query = `
      query GetProjects($teamId: String, $state: String, $limit: Int) {
        projects(
          filter: {
            team: { id: { eq: $teamId } }
            state: { eq: $state }
          }
          first: $limit
        ) {
          nodes {
            id
            name
            description
            state
            progress
            targetDate
            team {
              id
              name
            }
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.graphqlQuery(query, { teamId, state, limit });
    return data.projects.nodes;
  }

  // Create project
  async createProject(input: {
    teamId: string;
    name: string;
    description?: string;
    state?: string;
    targetDate?: string;
  }) {
    const mutation = `
      mutation CreateProject($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          success
          project {
            id
            name
            description
            state
            progress
            targetDate
            team {
              id
              name
            }
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.graphqlQuery(mutation, { input });
    return data.projectCreate;
  }

  // Get team by ID
  async getTeam(teamId: string): Promise<z.infer<typeof LinearTeamSchema>> {
    const query = `
      query GetTeam($id: String!) {
        team(id: $id) {
          id
          name
          key
          description
          members {
            nodes {
              id
              name
              email
            }
          }
        }
      }
    `;

    const data = await this.graphqlQuery(query, { id: teamId });
    return LinearTeamSchema.parse(data.team);
  }

  // Get all teams
  async getTeams(limit?: number) {
    const query = `
      query GetTeams($limit: Int) {
        teams(first: $limit) {
          nodes {
            id
            name
            key
            description
            members {
              nodes {
                id
                name
                email
              }
            }
          }
        }
      }
    `;

    const data = await this.graphqlQuery(query, { limit });
    return data.teams.nodes;
  }

  // Search issues
  async searchIssues(query: string, teamId?: string, limit?: number) {
    const searchQuery = `
      query SearchIssues($query: String!, $teamId: String, $limit: Int) {
        issueSearch(query: $query, teamId: $teamId, first: $limit) {
          nodes {
            id
            identifier
            title
            description
            state {
              id
              name
              type
            }
            priority
            assignee {
              id
              name
              email
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const data = await this.graphqlQuery(searchQuery, { query, teamId, limit });
    return data.issueSearch.nodes;
  }

  // Get current user
  async getMe() {
    const query = `
      query GetMe {
        viewer {
          id
          name
          email
          avatarUrl
          teams {
            nodes {
              id
              name
              key
            }
          }
        }
      }
    `;

    const data = await this.graphqlQuery(query);
    return data.viewer;
  }
}

// MCP Tools for Linear
export const linearTools = {
  'linear.get-issue': {
    description: 'Get a Linear issue by ID',
    parameters: {
      type: 'object',
      properties: {
        issueId: {
          type: 'string',
          description: 'The ID of the issue to retrieve'
        }
      },
      required: ['issueId']
    }
  },
  'linear.get-issues': {
    description: 'Get Linear issues with optional filters',
    parameters: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'Filter by team ID'
        },
        state: {
          type: 'string',
          description: 'Filter by state name'
        },
        assigneeId: {
          type: 'string',
          description: 'Filter by assignee ID'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of issues to return'
        }
      }
    }
  },
  'linear.create-issue': {
    description: 'Create a new Linear issue',
    parameters: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team to create the issue in'
        },
        title: {
          type: 'string',
          description: 'Title of the issue'
        },
        description: {
          type: 'string',
          description: 'Description of the issue'
        },
        stateId: {
          type: 'string',
          description: 'ID of the state to set'
        },
        assigneeId: {
          type: 'string',
          description: 'ID of the assignee'
        },
        projectId: {
          type: 'string',
          description: 'ID of the project'
        },
        priority: {
          type: 'number',
          description: 'Priority of the issue (0-4)'
        }
      },
      required: ['teamId', 'title']
    }
  },
  'linear.update-issue': {
    description: 'Update an existing Linear issue',
    parameters: {
      type: 'object',
      properties: {
        issueId: {
          type: 'string',
          description: 'ID of the issue to update'
        },
        title: {
          type: 'string',
          description: 'New title for the issue'
        },
        description: {
          type: 'string',
          description: 'New description for the issue'
        },
        stateId: {
          type: 'string',
          description: 'New state ID for the issue'
        },
        assigneeId: {
          type: 'string',
          description: 'New assignee ID for the issue'
        },
        projectId: {
          type: 'string',
          description: 'New project ID for the issue'
        },
        priority: {
          type: 'number',
          description: 'New priority for the issue (0-4)'
        }
      },
      required: ['issueId']
    }
  },
  'linear.get-project': {
    description: 'Get a Linear project by ID',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project to retrieve'
        }
      },
      required: ['projectId']
    }
  },
  'linear.get-projects': {
    description: 'Get Linear projects with optional filters',
    parameters: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'Filter by team ID'
        },
        state: {
          type: 'string',
          description: 'Filter by project state'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of projects to return'
        }
      }
    }
  },
  'linear.create-project': {
    description: 'Create a new Linear project',
    parameters: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team to create the project in'
        },
        name: {
          type: 'string',
          description: 'Name of the project'
        },
        description: {
          type: 'string',
          description: 'Description of the project'
        },
        state: {
          type: 'string',
          description: 'State of the project'
        },
        targetDate: {
          type: 'string',
          description: 'Target date for the project (ISO 8601)'
        }
      },
      required: ['teamId', 'name']
    }
  },
  'linear.get-team': {
    description: 'Get a Linear team by ID',
    parameters: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'The ID of the team to retrieve'
        }
      },
      required: ['teamId']
    }
  },
  'linear.get-teams': {
    description: 'Get all Linear teams',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of teams to return'
        }
      }
    }
  },
  'linear.search-issues': {
    description: 'Search Linear issues',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        teamId: {
          type: 'string',
          description: 'Filter by team ID'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return'
        }
      },
      required: ['query']
    }
  },
  'linear.get-me': {
    description: 'Get current user information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeLinearTool(tool: string, args: any, config: any) {
  const linear = new LinearMCPServer(config);
  
  switch (tool) {
    case 'linear.get-issue':
      return await linear.getIssue(args.issueId);
    
    case 'linear.get-issues':
      return await linear.getIssues(args.teamId, args.state, args.assigneeId, args.limit);
    
    case 'linear.create-issue':
      return await linear.createIssue(args);
    
    case 'linear.update-issue':
      return await linear.updateIssue(args.issueId, args);
    
    case 'linear.get-project':
      return await linear.getProject(args.projectId);
    
    case 'linear.get-projects':
      return await linear.getProjects(args.teamId, args.state, args.limit);
    
    case 'linear.create-project':
      return await linear.createProject(args);
    
    case 'linear.get-team':
      return await linear.getTeam(args.teamId);
    
    case 'linear.get-teams':
      return await linear.getTeams(args.limit);
    
    case 'linear.search-issues':
      return await linear.searchIssues(args.query, args.teamId, args.limit);
    
    case 'linear.get-me':
      return await linear.getMe();
    
    default:
      throw new Error(`Unknown Linear tool: ${tool}`);
  }
}
