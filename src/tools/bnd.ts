import { z } from 'zod';

// Bnd MCP Server Integration
// Provides tools for interacting with Bnd blockchain and DeFi operations

const BndConfigSchema = z.object({
  apiKey: z.string().min(1, 'Bnd API key is required'),
  baseUrl: z.string().default('https://api.bnd.com/v1'),
  network: z.string().default('mainnet')
});

const BndTransactionSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  gas: z.string(),
  gasPrice: z.string(),
  nonce: z.number(),
  blockNumber: z.number(),
  blockHash: z.string(),
  transactionIndex: z.number(),
  status: z.string(),
  timestamp: z.number()
});

const BndTokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  totalSupply: z.string(),
  price: z.number().optional(),
  marketCap: z.number().optional(),
  volume24h: z.number().optional()
});

export class BndMCPServer {
  private config: z.infer<typeof BndConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof BndConfigSchema>) {
    this.config = BndConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Network': this.config.network
    };
  }

  // Get account balance
  async getAccountBalance(address: string): Promise<{ balance: string; currency: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/accounts/${address}/balance`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        balance: data.balance,
        currency: data.currency || 'ETH'
      };
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get transaction by hash
  async getTransaction(txHash: string): Promise<z.infer<typeof BndTransactionSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transactions/${txHash}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BndTransactionSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get account transactions
  async getAccountTransactions(address: string, limit: number = 50, offset: number = 0) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`${this.config.baseUrl}/accounts/${address}/transactions?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.transactions.map((tx: any) => BndTransactionSchema.parse(tx));
    } catch (error) {
      throw new Error(`Failed to get account transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send transaction
  async sendTransaction(from: string, to: string, value: string, gasLimit?: string, gasPrice?: string) {
    try {
      const txData: any = { from, to, value };
      if (gasLimit) txData.gasLimit = gasLimit;
      if (gasPrice) txData.gasPrice = gasPrice;

      const response = await fetch(`${this.config.baseUrl}/transactions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(txData)
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get token information
  async getTokenInfo(tokenAddress: string): Promise<z.infer<typeof BndTokenSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/tokens/${tokenAddress}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return BndTokenSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get token balance
  async getTokenBalance(address: string, tokenAddress: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/accounts/${address}/tokens/${tokenAddress}/balance`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get DeFi protocols
  async getDeFiProtocols() {
    try {
      const response = await fetch(`${this.config.baseUrl}/defi/protocols`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.protocols;
    } catch (error) {
      throw new Error(`Failed to get DeFi protocols: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get liquidity pools
  async getLiquidityPools(protocol?: string) {
    try {
      const params = new URLSearchParams();
      if (protocol) params.append('protocol', protocol);

      const response = await fetch(`${this.config.baseUrl}/defi/pools?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.pools;
    } catch (error) {
      throw new Error(`Failed to get liquidity pools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get market data
  async getMarketData(symbol?: string) {
    try {
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);

      const response = await fetch(`${this.config.baseUrl}/market?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get market data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get network status
  async getNetworkStatus() {
    try {
      const response = await fetch(`${this.config.baseUrl}/network/status`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Bnd API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get network status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Bnd
export const bndTools = {
  'bnd.get-account-balance': {
    description: 'Get account balance',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' }
      },
      required: ['address']
    }
  },
  'bnd.get-transaction': {
    description: 'Get transaction by hash',
    parameters: {
      type: 'object',
      properties: {
        txHash: { type: 'string', description: 'Transaction hash' }
      },
      required: ['txHash']
    }
  },
  'bnd.get-account-transactions': {
    description: 'Get account transactions',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' },
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' }
      },
      required: ['address']
    }
  },
  'bnd.send-transaction': {
    description: 'Send transaction',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'From address' },
        to: { type: 'string', description: 'To address' },
        value: { type: 'string', description: 'Transaction value' },
        gasLimit: { type: 'string', description: 'Gas limit' },
        gasPrice: { type: 'string', description: 'Gas price' }
      },
      required: ['from', 'to', 'value']
    }
  },
  'bnd.get-token-info': {
    description: 'Get token information',
    parameters: {
      type: 'object',
      properties: {
        tokenAddress: { type: 'string', description: 'Token contract address' }
      },
      required: ['tokenAddress']
    }
  },
  'bnd.get-token-balance': {
    description: 'Get token balance for account',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' },
        tokenAddress: { type: 'string', description: 'Token contract address' }
      },
      required: ['address', 'tokenAddress']
    }
  },
  'bnd.get-defi-protocols': {
    description: 'Get DeFi protocols',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'bnd.get-liquidity-pools': {
    description: 'Get liquidity pools',
    parameters: {
      type: 'object',
      properties: {
        protocol: { type: 'string', description: 'Protocol name' }
      }
    }
  },
  'bnd.get-market-data': {
    description: 'Get market data',
    parameters: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Token symbol' }
      }
    }
  },
  'bnd.get-network-status': {
    description: 'Get network status',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeBndTool(tool: string, args: any, config: any) {
  const bnd = new BndMCPServer(config);
  
  switch (tool) {
    case 'bnd.get-account-balance':
      return await bnd.getAccountBalance(args.address);
    
    case 'bnd.get-transaction':
      return await bnd.getTransaction(args.txHash);
    
    case 'bnd.get-account-transactions':
      return await bnd.getAccountTransactions(args.address, args.limit, args.offset);
    
    case 'bnd.send-transaction':
      return await bnd.sendTransaction(args.from, args.to, args.value, args.gasLimit, args.gasPrice);
    
    case 'bnd.get-token-info':
      return await bnd.getTokenInfo(args.tokenAddress);
    
    case 'bnd.get-token-balance':
      return await bnd.getTokenBalance(args.address, args.tokenAddress);
    
    case 'bnd.get-defi-protocols':
      return await bnd.getDeFiProtocols();
    
    case 'bnd.get-liquidity-pools':
      return await bnd.getLiquidityPools(args.protocol);
    
    case 'bnd.get-market-data':
      return await bnd.getMarketData(args.symbol);
    
    case 'bnd.get-network-status':
      return await bnd.getNetworkStatus();
    
    default:
      throw new Error(`Unknown Bnd tool: ${tool}`);
  }
}
