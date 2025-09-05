import { z } from 'zod';

// OpenAI MCP Server Integration
// Provides tools for interacting with OpenAI models, embeddings, and fine-tuning

const OpenAIConfigSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
  baseUrl: z.string().default('https://api.openai.com/v1'),
  organization: z.string().optional(),
  defaultModel: z.string().default('gpt-4o')
});

const OpenAIMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
  name: z.string().optional(),
  tool_calls: z.array(z.any()).optional()
});

const OpenAIModelSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  owned_by: z.string(),
  permission: z.array(z.any()),
  root: z.string().optional(),
  parent: z.string().optional()
});

const OpenAIEmbeddingSchema = z.object({
  object: z.string(),
  data: z.array(z.object({
    object: z.string(),
    index: z.number(),
    embedding: z.array(z.number())
  })),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number()
  })
});

export class OpenAIMCPServer {
  private config: z.infer<typeof OpenAIConfigSchema>;
  private headers: Record<string, string>;

  constructor(config: z.infer<typeof OpenAIConfigSchema>) {
    this.config = OpenAIConfigSchema.parse(config);
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
    if (this.config.organization) {
      this.headers['OpenAI-Organization'] = this.config.organization;
    }
  }

  // Generate text completion
  async generateText(prompt: string, model?: string, maxTokens?: number, temperature?: number, topP?: number, frequencyPenalty?: number, presencePenalty?: number, stop?: string[]) {
    try {
      const requestData: any = {
        model: model || this.config.defaultModel,
        prompt: prompt,
        max_tokens: maxTokens || 1000,
        temperature: temperature || 0.7,
        top_p: topP || 1,
        frequency_penalty: frequencyPenalty || 0,
        presence_penalty: presencePenalty || 0
      };

      if (stop) requestData.stop = stop;

      const response = await fetch(`${this.config.baseUrl}/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate chat completion
  async generateChat(messages: z.infer<typeof OpenAIMessageSchema>[], model?: string, maxTokens?: number, temperature?: number, topP?: number, frequencyPenalty?: number, presencePenalty?: number, stop?: string[], tools?: any[], toolChoice?: string) {
    try {
      const requestData: any = {
        model: model || this.config.defaultModel,
        messages: messages,
        max_tokens: maxTokens || 1000,
        temperature: temperature || 0.7,
        top_p: topP || 1,
        frequency_penalty: frequencyPenalty || 0,
        presence_penalty: presencePenalty || 0
      };

      if (stop) requestData.stop = stop;
      if (tools) requestData.tools = tools;
      if (toolChoice) requestData.tool_choice = toolChoice;

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to generate chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate embeddings
  async generateEmbeddings(input: string | string[], model: string = 'text-embedding-3-small', encodingFormat?: string, dimensions?: number) {
    try {
      const requestData: any = {
        model: model,
        input: input
      };

      if (encodingFormat) requestData.encoding_format = encodingFormat;
      if (dimensions) requestData.dimensions = dimensions;

      const response = await fetch(`${this.config.baseUrl}/embeddings`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return OpenAIEmbeddingSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get available models
  async getModels(): Promise<z.infer<typeof OpenAIModelSchema>[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => OpenAIModelSchema.parse(model));
    } catch (error) {
      throw new Error(`Failed to get models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get model information
  async getModel(modelId: string): Promise<z.infer<typeof OpenAIModelSchema>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models/${modelId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return OpenAIModelSchema.parse(data);
    } catch (error) {
      throw new Error(`Failed to get model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create fine-tuning job
  async createFineTuningJob(trainingFile: string, validationFile?: string, model?: string, hyperparameters?: any, suffix?: string) {
    try {
      const requestData: any = {
        training_file: trainingFile,
        model: model || 'gpt-3.5-turbo'
      };

      if (validationFile) requestData.validation_file = validationFile;
      if (hyperparameters) requestData.hyperparameters = hyperparameters;
      if (suffix) requestData.suffix = suffix;

      const response = await fetch(`${this.config.baseUrl}/fine_tuning/jobs`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create fine-tuning job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List fine-tuning jobs
  async listFineTuningJobs(limit?: number, after?: string) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (after) params.append('after', after);

      const response = await fetch(`${this.config.baseUrl}/fine_tuning/jobs?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list fine-tuning jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get fine-tuning job
  async getFineTuningJob(jobId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/fine_tuning/jobs/${jobId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get fine-tuning job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cancel fine-tuning job
  async cancelFineTuningJob(jobId: string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/fine_tuning/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to cancel fine-tuning job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List fine-tuning events
  async listFineTuningEvents(jobId: string, limit?: number, after?: string) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (after) params.append('after', after);

      const response = await fetch(`${this.config.baseUrl}/fine_tuning/jobs/${jobId}/events?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to list fine-tuning events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create image
  async createImage(prompt: string, n?: number, size?: string, quality?: string, style?: string, user?: string) {
    try {
      const requestData: any = {
        prompt: prompt,
        n: n || 1,
        size: size || '1024x1024',
        quality: quality || 'standard',
        style: style || 'vivid'
      };

      if (user) requestData.user = user;

      const response = await fetch(`${this.config.baseUrl}/images/generations`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create image edit
  async createImageEdit(image: string, mask: string, prompt: string, n?: number, size?: string, user?: string) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('mask', mask);
      formData.append('prompt', prompt);
      if (n) formData.append('n', n.toString());
      if (size) formData.append('size', size);
      if (user) formData.append('user', user);

      const response = await fetch(`${this.config.baseUrl}/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create image edit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create image variation
  async createImageVariation(image: string, n?: number, size?: string, user?: string) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      if (n) formData.append('n', n.toString());
      if (size) formData.append('size', size);
      if (user) formData.append('user', user);

      const response = await fetch(`${this.config.baseUrl}/images/variations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create image variation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create transcription
  async createTranscription(file: string, model: string = 'whisper-1', language?: string, prompt?: string, responseFormat?: string, temperature?: number) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);
      if (language) formData.append('language', language);
      if (prompt) formData.append('prompt', prompt);
      if (responseFormat) formData.append('response_format', responseFormat);
      if (temperature) formData.append('temperature', temperature.toString());

      const response = await fetch(`${this.config.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create transcription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create translation
  async createTranslation(file: string, model: string = 'whisper-1', prompt?: string, responseFormat?: string, temperature?: number) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);
      if (prompt) formData.append('prompt', prompt);
      if (responseFormat) formData.append('response_format', responseFormat);
      if (temperature) formData.append('temperature', temperature.toString());

      const response = await fetch(`${this.config.baseUrl}/audio/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for OpenAI
export const openaiTools = {
  'openai.generate-text': {
    description: 'Generate text completion',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt' },
        model: { type: 'string', description: 'Model to use' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' },
        temperature: { type: 'number', description: 'Temperature for generation' },
        topP: { type: 'number', description: 'Top-p sampling parameter' },
        frequencyPenalty: { type: 'number', description: 'Frequency penalty' },
        presencePenalty: { type: 'number', description: 'Presence penalty' },
        stop: { type: 'array', items: { type: 'string' }, description: 'Stop sequences' }
      },
      required: ['prompt']
    }
  },
  'openai.generate-chat': {
    description: 'Generate chat completion',
    parameters: {
      type: 'object',
      properties: {
        messages: { type: 'array', items: { type: 'object' }, description: 'Chat messages' },
        model: { type: 'string', description: 'Model to use' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' },
        temperature: { type: 'number', description: 'Temperature for generation' },
        topP: { type: 'number', description: 'Top-p sampling parameter' },
        frequencyPenalty: { type: 'number', description: 'Frequency penalty' },
        presencePenalty: { type: 'number', description: 'Presence penalty' },
        stop: { type: 'array', items: { type: 'string' }, description: 'Stop sequences' },
        tools: { type: 'array', description: 'Tools to use' },
        toolChoice: { type: 'string', description: 'Tool choice strategy' }
      },
      required: ['messages']
    }
  },
  'openai.generate-embeddings': {
    description: 'Generate embeddings',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to embed' },
        model: { type: 'string', description: 'Embedding model' },
        encodingFormat: { type: 'string', description: 'Encoding format' },
        dimensions: { type: 'number', description: 'Number of dimensions' }
      },
      required: ['input']
    }
  },
  'openai.get-models': {
    description: 'Get available models',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'openai.get-model': {
    description: 'Get model information',
    parameters: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Model ID' }
      },
      required: ['modelId']
    }
  },
  'openai.create-fine-tuning-job': {
    description: 'Create fine-tuning job',
    parameters: {
      type: 'object',
      properties: {
        trainingFile: { type: 'string', description: 'Training file ID' },
        validationFile: { type: 'string', description: 'Validation file ID' },
        model: { type: 'string', description: 'Base model' },
        hyperparameters: { type: 'object', description: 'Hyperparameters' },
        suffix: { type: 'string', description: 'Model suffix' }
      },
      required: ['trainingFile']
    }
  },
  'openai.list-fine-tuning-jobs': {
    description: 'List fine-tuning jobs',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        after: { type: 'string', description: 'Cursor for pagination' }
      }
    }
  },
  'openai.get-fine-tuning-job': {
    description: 'Get fine-tuning job',
    parameters: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'Job ID' }
      },
      required: ['jobId']
    }
  },
  'openai.cancel-fine-tuning-job': {
    description: 'Cancel fine-tuning job',
    parameters: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'Job ID' }
      },
      required: ['jobId']
    }
  },
  'openai.list-fine-tuning-events': {
    description: 'List fine-tuning events',
    parameters: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'Job ID' },
        limit: { type: 'number', description: 'Number of results per page' },
        after: { type: 'string', description: 'Cursor for pagination' }
      },
      required: ['jobId']
    }
  },
  'openai.create-image': {
    description: 'Create image',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Image prompt' },
        n: { type: 'number', description: 'Number of images' },
        size: { type: 'string', description: 'Image size' },
        quality: { type: 'string', description: 'Image quality' },
        style: { type: 'string', description: 'Image style' },
        user: { type: 'string', description: 'User identifier' }
      },
      required: ['prompt']
    }
  },
  'openai.create-image-edit': {
    description: 'Create image edit',
    parameters: {
      type: 'object',
      properties: {
        image: { type: 'string', description: 'Image file' },
        mask: { type: 'string', description: 'Mask file' },
        prompt: { type: 'string', description: 'Edit prompt' },
        n: { type: 'number', description: 'Number of images' },
        size: { type: 'string', description: 'Image size' },
        user: { type: 'string', description: 'User identifier' }
      },
      required: ['image', 'mask', 'prompt']
    }
  },
  'openai.create-image-variation': {
    description: 'Create image variation',
    parameters: {
      type: 'object',
      properties: {
        image: { type: 'string', description: 'Image file' },
        n: { type: 'number', description: 'Number of images' },
        size: { type: 'string', description: 'Image size' },
        user: { type: 'string', description: 'User identifier' }
      },
      required: ['image']
    }
  },
  'openai.create-transcription': {
    description: 'Create transcription',
    parameters: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'Audio file' },
        model: { type: 'string', description: 'Whisper model' },
        language: { type: 'string', description: 'Audio language' },
        prompt: { type: 'string', description: 'Transcription prompt' },
        responseFormat: { type: 'string', description: 'Response format' },
        temperature: { type: 'number', description: 'Temperature' }
      },
      required: ['file']
    }
  },
  'openai.create-translation': {
    description: 'Create translation',
    parameters: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'Audio file' },
        model: { type: 'string', description: 'Whisper model' },
        prompt: { type: 'string', description: 'Translation prompt' },
        responseFormat: { type: 'string', description: 'Response format' },
        temperature: { type: 'number', description: 'Temperature' }
      },
      required: ['file']
    }
  },
  'openai.get-usage-stats': {
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
export async function executeOpenAITool(tool: string, args: any, config: any) {
  const openai = new OpenAIMCPServer(config);
  
  switch (tool) {
    case 'openai.generate-text':
      return await openai.generateText(args.prompt, args.model, args.maxTokens, args.temperature, args.topP, args.frequencyPenalty, args.presencePenalty, args.stop);
    
    case 'openai.generate-chat':
      return await openai.generateChat(args.messages, args.model, args.maxTokens, args.temperature, args.topP, args.frequencyPenalty, args.presencePenalty, args.stop, args.tools, args.toolChoice);
    
    case 'openai.generate-embeddings':
      return await openai.generateEmbeddings(args.input, args.model, args.encodingFormat, args.dimensions);
    
    case 'openai.get-models':
      return await openai.getModels();
    
    case 'openai.get-model':
      return await openai.getModel(args.modelId);
    
    case 'openai.create-fine-tuning-job':
      return await openai.createFineTuningJob(args.trainingFile, args.validationFile, args.model, args.hyperparameters, args.suffix);
    
    case 'openai.list-fine-tuning-jobs':
      return await openai.listFineTuningJobs(args.limit, args.after);
    
    case 'openai.get-fine-tuning-job':
      return await openai.getFineTuningJob(args.jobId);
    
    case 'openai.cancel-fine-tuning-job':
      return await openai.cancelFineTuningJob(args.jobId);
    
    case 'openai.list-fine-tuning-events':
      return await openai.listFineTuningEvents(args.jobId, args.limit, args.after);
    
    case 'openai.create-image':
      return await openai.createImage(args.prompt, args.n, args.size, args.quality, args.style, args.user);
    
    case 'openai.create-image-edit':
      return await openai.createImageEdit(args.image, args.mask, args.prompt, args.n, args.size, args.user);
    
    case 'openai.create-image-variation':
      return await openai.createImageVariation(args.image, args.n, args.size, args.user);
    
    case 'openai.create-transcription':
      return await openai.createTranscription(args.file, args.model, args.language, args.prompt, args.responseFormat, args.temperature);
    
    case 'openai.create-translation':
      return await openai.createTranslation(args.file, args.model, args.prompt, args.responseFormat, args.temperature);
    
    case 'openai.get-usage-stats':
      return await openai.getUsageStats(args.startDate, args.endDate);
    
    default:
      throw new Error(`Unknown OpenAI tool: ${tool}`);
  }
}
