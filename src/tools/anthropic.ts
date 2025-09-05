import { z } from 'zod';

// Anthropic MCP Server Integration
// Provides tools for interacting with Anthropic AI models and services

const AnthropicConfigSchema = z.object({
  apiKey: z.string().min(1, 'Anthropic API key is required'),
  baseUrl: z.string().default('https://api.anthropic.com/v1'),
  model: z.string().default('claude-3-sonnet-20240229')
});

const AnthropicMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  model: z.string(),
  stop_reason: z.string().optional(),
  stop_sequence: z.string().optional(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number()
  }).optional()
});

const AnthropicModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  context_length: z.number(),
  max_tokens: z.number(),
  pricing: z.object({
    input: z.number(),
    output: z.number()
  }).optional()
});

export class AnthropicMCPServer {
  private config: z.infer<typeof AnthropicConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof AnthropicConfigSchema>) {
    this.config = AnthropicConfigSchema.parse(config);
    this.headers = {
      'x-api-key': this.config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    };
  }

  // Generate text completion
  async generateText(prompt: string, maxTokens?: number, temperature?: number, stopSequences?: string[]) {
    try {
      const requestData: any = {
        model: this.config.model,
        max_tokens: maxTokens || 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      if (temperature) requestData.temperature = temperature;
      if (stopSequences) requestData.stop_sequences = stopSequences;

      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return AnthropicMessageSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate chat completion
  async generateChat(messages: Array<{ role: string; content: string }>, maxTokens?: number, temperature?: number) {
    try {
      const requestData: any = {
        model: this.config.model,
        max_tokens: maxTokens || 1000,
        messages: messages
      };

      if (temperature) requestData.temperature = temperature;

      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return AnthropicMessageSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to generate chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get available models
  async getModels(): Promise<z.infer<typeof AnthropicModelSchema>[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.models.map((model: any) => AnthropicModelSchema.parse(model));
    } catch (error) {
      throw new Error(`Failed to get models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get model information
  async getModel(modelId: string): Promise<z.infer<typeof AnthropicModelSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models/${modelId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return AnthropicModelSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze text sentiment
  async analyzeSentiment(text: string) {
    try {
      const prompt = `Analyze the sentiment of the following text and return a JSON response with sentiment (positive, negative, neutral) and confidence score (0-1):

Text: "${text}"`;

      const response = await this.generateText(prompt, 200, 0.1);
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error(`Failed to analyze sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract entities from text
  async extractEntities(text: string) {
    try {
      const prompt = `Extract named entities from the following text and return a JSON response with entities and their types:

Text: "${text}"`;

      const response = await this.generateText(prompt, 300, 0.1);
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error(`Failed to extract entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Summarize text
  async summarizeText(text: string, maxLength?: number) {
    try {
      const prompt = `Summarize the following text in ${maxLength || 100} words or less:

Text: "${text}"`;

      const response = await this.generateText(prompt, maxLength || 200, 0.3);
      return response.content;
    } catch (error) {
      throw new Error(`Failed to summarize text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Translate text
  async translateText(text: string, targetLanguage: string, sourceLanguage?: string) {
    try {
      const prompt = `Translate the following text from ${sourceLanguage || 'auto-detect'} to ${targetLanguage}:

Text: "${text}"`;

      const response = await this.generateText(prompt, 500, 0.1);
      return response.content;
    } catch (error) {
      throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate code
  async generateCode(description: string, language: string, context?: string) {
    try {
      const prompt = `Generate ${language} code based on the following description:

Description: "${description}"

${context ? `Context: "${context}"` : ''}

Return only the code without explanations.`;

      const response = await this.generateText(prompt, 1000, 0.2);
      return response.content;
    } catch (error) {
      throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Answer question
  async answerQuestion(question: string, context?: string) {
    try {
      const prompt = `Answer the following question${context ? ' based on the provided context' : ''}:

Question: "${question}"

${context ? `Context: "${context}"` : ''}

Provide a clear and accurate answer.`;

      const response = await this.generateText(prompt, 500, 0.3);
      return response.content;
    } catch (error) {
      throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get usage statistics
  async getUsageStats(startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${this.config.baseUrl}/usage?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for Anthropic
export const anthropicTools = {
  'anthropic.generate-text': {
    description: 'Generate text completion',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' },
        temperature: { type: 'number', description: 'Temperature for generation' },
        stopSequences: { type: 'array', items: { type: 'string' }, description: 'Stop sequences' }
      },
      required: ['prompt']
    }
  },
  'anthropic.generate-chat': {
    description: 'Generate chat completion',
    parameters: {
      type: 'object',
      properties: {
        messages: { type: 'array', items: { type: 'object' }, description: 'Chat messages' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' },
        temperature: { type: 'number', description: 'Temperature for generation' }
      },
      required: ['messages']
    }
  },
  'anthropic.get-models': {
    description: 'Get available models',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'anthropic.get-model': {
    description: 'Get model information',
    parameters: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Model ID' }
      },
      required: ['modelId']
    }
  },
  'anthropic.analyze-sentiment': {
    description: 'Analyze text sentiment',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to analyze' }
      },
      required: ['text']
    }
  },
  'anthropic.extract-entities': {
    description: 'Extract named entities from text',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to analyze' }
      },
      required: ['text']
    }
  },
  'anthropic.summarize-text': {
    description: 'Summarize text',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to summarize' },
        maxLength: { type: 'number', description: 'Maximum summary length' }
      },
      required: ['text']
    }
  },
  'anthropic.translate-text': {
    description: 'Translate text',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to translate' },
        targetLanguage: { type: 'string', description: 'Target language' },
        sourceLanguage: { type: 'string', description: 'Source language' }
      },
      required: ['text', 'targetLanguage']
    }
  },
  'anthropic.generate-code': {
    description: 'Generate code',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Code description' },
        language: { type: 'string', description: 'Programming language' },
        context: { type: 'string', description: 'Additional context' }
      },
      required: ['description', 'language']
    }
  },
  'anthropic.answer-question': {
    description: 'Answer a question',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Question to answer' },
        context: { type: 'string', description: 'Additional context' }
      },
      required: ['question']
    }
  },
  'anthropic.get-usage-stats': {
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
export async function executeAnthropicTool(tool: string, args: any, config: any) {
  const anthropic = new AnthropicMCPServer(config);
  
  switch (tool) {
    case 'anthropic.generate-text':
      return await anthropic.generateText(args.prompt, args.maxTokens, args.temperature, args.stopSequences);
    
    case 'anthropic.generate-chat':
      return await anthropic.generateChat(args.messages, args.maxTokens, args.temperature);
    
    case 'anthropic.get-models':
      return await anthropic.getModels();
    
    case 'anthropic.get-model':
      return await anthropic.getModel(args.modelId);
    
    case 'anthropic.analyze-sentiment':
      return await anthropic.analyzeSentiment(args.text);
    
    case 'anthropic.extract-entities':
      return await anthropic.extractEntities(args.text);
    
    case 'anthropic.summarize-text':
      return await anthropic.summarizeText(args.text, args.maxLength);
    
    case 'anthropic.translate-text':
      return await anthropic.translateText(args.text, args.targetLanguage, args.sourceLanguage);
    
    case 'anthropic.generate-code':
      return await anthropic.generateCode(args.description, args.language, args.context);
    
    case 'anthropic.answer-question':
      return await anthropic.answerQuestion(args.question, args.context);
    
    case 'anthropic.get-usage-stats':
      return await anthropic.getUsageStats(args.startDate, args.endDate);
    
    default:
      throw new Error(`Unknown Anthropic tool: ${tool}`);
  }
}
