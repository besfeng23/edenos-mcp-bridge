import { z } from 'zod';

// GitHub MCP Server Integration
// Provides tools for interacting with GitHub repositories, issues, pull requests, and actions

const GitHubConfigSchema = z.object({
  token: z.string().min(1, 'GitHub token is required'),
  baseUrl: z.string().default('https://api.github.com'),
  owner: z.string().optional(),
  repo: z.string().optional()
});

const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().optional(),
  html_url: z.string(),
  clone_url: z.string(),
  ssh_url: z.string(),
  language: z.string().optional(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  default_branch: z.string(),
  private: z.boolean(),
  archived: z.boolean(),
  disabled: z.boolean()
});

const GitHubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  body: z.string().optional(),
  state: z.enum(['open', 'closed']),
  labels: z.array(z.object({
    id: z.number(),
    name: z.string(),
    color: z.string()
  })),
  assignees: z.array(z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  })),
  user: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  }),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().optional(),
  html_url: z.string()
});

const GitHubPullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  body: z.string().optional(),
  state: z.enum(['open', 'closed', 'merged']),
  head: z.object({
    ref: z.string(),
    sha: z.string()
  }),
  base: z.object({
    ref: z.string(),
    sha: z.string()
  }),
  user: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  }),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().optional(),
  closed_at: z.string().optional(),
  html_url: z.string(),
  mergeable: z.boolean().optional(),
  mergeable_state: z.string().optional()
});

export class GitHubMCPServer {
  private config: z.infer<typeof GitHubConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof GitHubConfigSchema>) {
    this.config = GitHubConfigSchema.parse(config);
    this.headers = {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'EdenOS-MCP-Bridge'
    };
  }

  // Get repository information
  async getRepository(owner: string, repo: string): Promise<z.infer<typeof GitHubRepositorySchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return GitHubRepositorySchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List repositories
  async listRepositories(owner?: string, type: 'all' | 'owner' | 'public' | 'private' | 'member' = 'all', sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated', direction: 'asc' | 'desc' = 'desc', perPage: number = 30) {
    try {
      const url = owner 
        ? `${this.config.baseUrl}/users/${owner}/repos`
        : `${this.config.baseUrl}/user/repos`;
      
      const params = new URLSearchParams({
        type,
        sort,
        direction,
        per_page: perPage.toString()
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get issue by number
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<z.infer<typeof GitHubIssueSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return GitHubIssueSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List issues
  async listIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', labels?: string[], assignee?: string, creator?: string, mentioned?: string, sort: 'created' | 'updated' | 'comments' = 'created', direction: 'asc' | 'desc' = 'desc', since?: string, perPage: number = 30) {
    try {
      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: perPage.toString()
      });

      if (labels) params.append('labels', labels.join(','));
      if (assignee) params.append('assignee', assignee);
      if (creator) params.append('creator', creator);
      if (mentioned) params.append('mentioned', mentioned);
      if (since) params.append('since', since);

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/issues?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create issue
  async createIssue(owner: string, repo: string, title: string, body?: string, assignees?: string[], labels?: string[], milestone?: number) {
    try {
      const issueData: any = { title };
      if (body) issueData.body = body;
      if (assignees) issueData.assignees = assignees;
      if (labels) issueData.labels = labels;
      if (milestone) issueData.milestone = milestone;

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(issueData)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update issue
  async updateIssue(owner: string, repo: string, issueNumber: number, title?: string, body?: string, state?: 'open' | 'closed', assignees?: string[], labels?: string[], milestone?: number) {
    try {
      const issueData: any = {};
      if (title) issueData.title = title;
      if (body) issueData.body = body;
      if (state) issueData.state = state;
      if (assignees) issueData.assignees = assignees;
      if (labels) issueData.labels = labels;
      if (milestone) issueData.milestone = milestone;

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(issueData)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to update issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get pull request by number
  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<z.infer<typeof GitHubPullRequestSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return GitHubPullRequestSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List pull requests
  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', head?: string, base?: string, sort: 'created' | 'updated' | 'popularity' | 'long-running' = 'created', direction: 'asc' | 'desc' = 'desc', perPage: number = 30) {
    try {
      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: perPage.toString()
      });

      if (head) params.append('head', head);
      if (base) params.append('base', base);

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/pulls?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create pull request
  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string, draft?: boolean) {
    try {
      const prData: any = { title, head, base };
      if (body) prData.body = body;
      if (draft) prData.draft = draft;

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(prData)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Merge pull request
  async mergePullRequest(owner: string, repo: string, pullNumber: number, commitTitle?: string, commitMessage?: string, mergeMethod: 'merge' | 'squash' | 'rebase' = 'merge') {
    try {
      const mergeData: any = { merge_method: mergeMethod };
      if (commitTitle) mergeData.commit_title = commitTitle;
      if (commitMessage) mergeData.commit_message = commitMessage;

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(mergeData)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to merge pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List workflow runs
  async listWorkflowRuns(owner: string, repo: string, workflowId?: string, actor?: string, branch?: string, event?: string, status?: 'queued' | 'in_progress' | 'completed', conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required', perPage: number = 30) {
    try {
      const params = new URLSearchParams({
        per_page: perPage.toString()
      });

      if (workflowId) params.append('workflow_id', workflowId);
      if (actor) params.append('actor', actor);
      if (branch) params.append('branch', branch);
      if (event) params.append('event', event);
      if (status) params.append('status', status);
      if (conclusion) params.append('conclusion', conclusion);

      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/actions/runs?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list workflow runs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get workflow run
  async getWorkflowRun(owner: string, repo: string, runId: number) {
    try {
      const response = await fetch(`${this.config.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get workflow run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search repositories
  async searchRepositories(query: string, sort: 'stars' | 'forks' | 'help-wanted-issues' | 'updated' = 'stars', order: 'asc' | 'desc' = 'desc', perPage: number = 30) {
    try {
      const params = new URLSearchParams({
        q: query,
        sort,
        order,
        per_page: perPage.toString()
      });

      const response = await fetch(`${this.config.baseUrl}/search/repositories?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to search repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search issues
  async searchIssues(query: string, sort: 'created' | 'updated' | 'comments' = 'created', order: 'asc' | 'desc' = 'desc', perPage: number = 30) {
    try {
      const params = new URLSearchParams({
        q: query,
        sort,
        order,
        per_page: perPage.toString()
      });

      const response = await fetch(`${this.config.baseUrl}/search/issues?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to search issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get current user
  async getMe() {
    try {
      const response = await fetch(`${this.config.baseUrl}/user`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for GitHub
export const githubTools = {
  'github.get-repository': {
    description: 'Get a GitHub repository by owner and name',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' }
      },
      required: ['owner', 'repo']
    }
  },
  'github.list-repositories': {
    description: 'List GitHub repositories',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Filter by owner' },
        type: { type: 'string', enum: ['all', 'owner', 'public', 'private', 'member'], description: 'Repository type' },
        sort: { type: 'string', enum: ['created', 'updated', 'pushed', 'full_name'], description: 'Sort field' },
        direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        perPage: { type: 'number', description: 'Number of results per page' }
      }
    }
  },
  'github.get-issue': {
    description: 'Get a GitHub issue by number',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        issueNumber: { type: 'number', description: 'Issue number' }
      },
      required: ['owner', 'repo', 'issueNumber']
    }
  },
  'github.list-issues': {
    description: 'List GitHub issues',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Filter by labels' },
        assignee: { type: 'string', description: 'Filter by assignee' },
        sort: { type: 'string', enum: ['created', 'updated', 'comments'], description: 'Sort field' },
        direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        perPage: { type: 'number', description: 'Number of results per page' }
      },
      required: ['owner', 'repo']
    }
  },
  'github.create-issue': {
    description: 'Create a new GitHub issue',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'Issue title' },
        body: { type: 'string', description: 'Issue body' },
        assignees: { type: 'array', items: { type: 'string' }, description: 'Assignees' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Labels' },
        milestone: { type: 'number', description: 'Milestone number' }
      },
      required: ['owner', 'repo', 'title']
    }
  },
  'github.update-issue': {
    description: 'Update a GitHub issue',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        issueNumber: { type: 'number', description: 'Issue number' },
        title: { type: 'string', description: 'New title' },
        body: { type: 'string', description: 'New body' },
        state: { type: 'string', enum: ['open', 'closed'], description: 'New state' },
        assignees: { type: 'array', items: { type: 'string' }, description: 'New assignees' },
        labels: { type: 'array', items: { type: 'string' }, description: 'New labels' },
        milestone: { type: 'number', description: 'New milestone' }
      },
      required: ['owner', 'repo', 'issueNumber']
    }
  },
  'github.get-pull-request': {
    description: 'Get a GitHub pull request by number',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        pullNumber: { type: 'number', description: 'Pull request number' }
      },
      required: ['owner', 'repo', 'pullNumber']
    }
  },
  'github.list-pull-requests': {
    description: 'List GitHub pull requests',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'PR state' },
        head: { type: 'string', description: 'Filter by head branch' },
        base: { type: 'string', description: 'Filter by base branch' },
        sort: { type: 'string', enum: ['created', 'updated', 'popularity', 'long-running'], description: 'Sort field' },
        direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        perPage: { type: 'number', description: 'Number of results per page' }
      },
      required: ['owner', 'repo']
    }
  },
  'github.create-pull-request': {
    description: 'Create a new GitHub pull request',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'PR title' },
        head: { type: 'string', description: 'Head branch' },
        base: { type: 'string', description: 'Base branch' },
        body: { type: 'string', description: 'PR body' },
        draft: { type: 'boolean', description: 'Create as draft' }
      },
      required: ['owner', 'repo', 'title', 'head', 'base']
    }
  },
  'github.merge-pull-request': {
    description: 'Merge a GitHub pull request',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        pullNumber: { type: 'number', description: 'Pull request number' },
        commitTitle: { type: 'string', description: 'Merge commit title' },
        commitMessage: { type: 'string', description: 'Merge commit message' },
        mergeMethod: { type: 'string', enum: ['merge', 'squash', 'rebase'], description: 'Merge method' }
      },
      required: ['owner', 'repo', 'pullNumber']
    }
  },
  'github.list-workflow-runs': {
    description: 'List GitHub workflow runs',
    parameters: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        workflowId: { type: 'string', description: 'Filter by workflow ID' },
        actor: { type: 'string', description: 'Filter by actor' },
        branch: { type: 'string', description: 'Filter by branch' },
        event: { type: 'string', description: 'Filter by event' },
        status: { type: 'string', enum: ['queued', 'in_progress', 'completed'], description: 'Filter by status' },
        conclusion: { type: 'string', enum: ['success', 'failure', 'neutral', 'cancelled', 'skipped', 'timed_out', 'action_required'], description: 'Filter by conclusion' },
        perPage: { type: 'number', description: 'Number of results per page' }
      },
      required: ['owner', 'repo']
    }
  },
  'github.search-repositories': {
    description: 'Search GitHub repositories',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        sort: { type: 'string', enum: ['stars', 'forks', 'help-wanted-issues', 'updated'], description: 'Sort field' },
        order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' },
        perPage: { type: 'number', description: 'Number of results per page' }
      },
      required: ['query']
    }
  },
  'github.search-issues': {
    description: 'Search GitHub issues',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        sort: { type: 'string', enum: ['created', 'updated', 'comments'], description: 'Sort field' },
        order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' },
        perPage: { type: 'number', description: 'Number of results per page' }
      },
      required: ['query']
    }
  },
  'github.get-me': {
    description: 'Get current GitHub user information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeGitHubTool(tool: string, args: any, config: any) {
  const github = new GitHubMCPServer(config);
  
  switch (tool) {
    case 'github.get-repository':
      return await github.getRepository(args.owner, args.repo);
    
    case 'github.list-repositories':
      return await github.listRepositories(args.owner, args.type, args.sort, args.direction, args.perPage);
    
    case 'github.get-issue':
      return await github.getIssue(args.owner, args.repo, args.issueNumber);
    
    case 'github.list-issues':
      return await github.listIssues(args.owner, args.repo, args.state, args.labels, args.assignee, args.creator, args.mentioned, args.sort, args.direction, args.since, args.perPage);
    
    case 'github.create-issue':
      return await github.createIssue(args.owner, args.repo, args.title, args.body, args.assignees, args.labels, args.milestone);
    
    case 'github.update-issue':
      return await github.updateIssue(args.owner, args.repo, args.issueNumber, args.title, args.body, args.state, args.assignees, args.labels, args.milestone);
    
    case 'github.get-pull-request':
      return await github.getPullRequest(args.owner, args.repo, args.pullNumber);
    
    case 'github.list-pull-requests':
      return await github.listPullRequests(args.owner, args.repo, args.state, args.head, args.base, args.sort, args.direction, args.perPage);
    
    case 'github.create-pull-request':
      return await github.createPullRequest(args.owner, args.repo, args.title, args.head, args.base, args.body, args.draft);
    
    case 'github.merge-pull-request':
      return await github.mergePullRequest(args.owner, args.repo, args.pullNumber, args.commitTitle, args.commitMessage, args.mergeMethod);
    
    case 'github.list-workflow-runs':
      return await github.listWorkflowRuns(args.owner, args.repo, args.workflowId, args.actor, args.branch, args.event, args.status, args.conclusion, args.perPage);
    
    case 'github.get-workflow-run':
      return await github.getWorkflowRun(args.owner, args.repo, args.runId);
    
    case 'github.search-repositories':
      return await github.searchRepositories(args.query, args.sort, args.order, args.perPage);
    
    case 'github.search-issues':
      return await github.searchIssues(args.query, args.sort, args.order, args.perPage);
    
    case 'github.get-me':
      return await github.getMe();
    
    default:
      throw new Error(`Unknown GitHub tool: ${tool}`);
  }
}
