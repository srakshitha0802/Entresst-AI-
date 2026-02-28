import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

// Use environment variables for API keys (recommended)
// For development, you can set these in a .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

// Initialize AI clients with provided keys
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const hf = new HfInference(HUGGINGFACE_API_KEY);

// Available LLM Models
export const LLM_MODELS = {
  // OpenAI Models
  openai: {
    'gpt-4o': { name: 'GPT-4o', provider: 'openai', contextWindow: 128000, description: 'Latest GPT-4 model with vision' },
    'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000, description: 'Fast GPT-4 with knowledge cutoff' },
    'gpt-4': { name: 'GPT-4', provider: 'openai', contextWindow: 8192, description: 'Most capable GPT-4 model' },
    'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385, description: 'Fast and affordable' },
    'gpt-3.5-turbo-16k': { name: 'GPT-3.5 Turbo 16K', provider: 'openai', contextWindow: 16385, description: 'Extended context version' },
    'o1-preview': { name: 'O1 Preview', provider: 'openai', contextWindow: 128000, description: 'Reasoning model' },
    'o1-mini': { name: 'O1 Mini', provider: 'openai', contextWindow: 128000, description: 'Fast reasoning model' },
  },
  // Google Gemini Models
  gemini: {
    'gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash', provider: 'gemini', contextWindow: 1000000, description: 'Latest fast model' },
    'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', provider: 'gemini', contextWindow: 2000000, description: 'Advanced model with long context' },
    'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', provider: 'gemini', contextWindow: 1000000, description: 'Fast and efficient' },
    'gemini-1.5-flash-8b': { name: 'Gemini 1.5 Flash 8B', provider: 'gemini', contextWindow: 1000000, description: 'Lightweight fast model' },
    'gemini-pro-vision': { name: 'Gemini Pro Vision', provider: 'gemini', contextWindow: 32768, description: 'Standard Gemini model with vision' },
  },
  // HuggingFace Models
  huggingface: {
    'meta-llama/Llama-3.3-70B-Instruct': { name: 'Llama 3.3 70B', provider: 'huggingface', contextWindow: 128000, description: 'Meta\'s latest instruction model' },
    'meta-llama/Llama-3.1-8B-Instruct': { name: 'Llama 3.1 8B', provider: 'huggingface', contextWindow: 128000, description: 'Efficient instruction model' },
    'Qwen/Qwen2.5-72B-Instruct': { name: 'Qwen 2.5 72B', provider: 'huggingface', contextWindow: 32768, description: 'Alibaba\'s powerful model' },
    'mistralai/Mistral-7B-Instruct-v0.3': { name: 'Mistral 7B', provider: 'huggingface', contextWindow: 32768, description: 'Efficient and capable' },
    'google/flan-t5-xxl': { name: 'FLAN-T5 XXL', provider: 'huggingface', contextWindow: 512, description: 'Google\'s instruction tuned model' },
    'bigscience/bloom-3b': { name: 'BLOOM 3B', provider: 'huggingface', contextWindow: 2048, description: 'Open multilingual model' },
  }
};

// Embedding Models
export const EMBEDDING_MODELS = {
  'text-embedding-3-small': { name: 'OpenAI Embeddings 3 Small', provider: 'openai', dimensions: 1536 },
  'text-embedding-3-large': { name: 'OpenAI Embeddings 3 Large', provider: 'openai', dimensions: 3072 },
  'text-embedding-ada-002': { name: 'OpenAI Ada v2', provider: 'openai', dimensions: 1536 },
  'gemini-embedding-001': { name: 'Gemini Embeddings', provider: 'gemini', dimensions: 768 },
};

export interface AIResponse {
  provider: 'gemini' | 'openai' | 'huggingface';
  response: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class AIService {
  // Gemini API - Using gemini-1.5-flash (valid model)
  static async geminiGenerate(prompt: string): Promise<AIResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return {
        provider: 'gemini',
        response: text
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // OpenAI API - Using gpt-4o for better performance
  static async openaiGenerate(prompt: string, model: string = 'gpt-4o'): Promise<AIResponse> {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return {
        provider: 'openai',
        response: completion.choices[0]?.message?.content || 'No response generated',
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens,
          completion_tokens: completion.usage?.completion_tokens,
          total_tokens: completion.usage?.total_tokens,
        }
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // HuggingFace API
  static async huggingfaceGenerate(prompt: string, model: string = 'google/flan-t5-base'): Promise<AIResponse> {
    try {
      const response = await hf.textGeneration({
        model,
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.7,
        }
      });

      return {
        provider: 'huggingface',
        response: response.generated_text
      };
    } catch (error) {
      console.error('HuggingFace API Error:', error);
      throw new Error(`HuggingFace API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Compare responses from all providers
  static async compareResponses(prompt: string): Promise<AIResponse[]> {
    const responses: AIResponse[] = [];
    
    try {
      const geminiResponse = await this.geminiGenerate(prompt);
      responses.push(geminiResponse);
    } catch (error) {
      responses.push({
        provider: 'gemini',
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    try {
      const openaiResponse = await this.openaiGenerate(prompt);
      responses.push(openaiResponse);
    } catch (error) {
      responses.push({
        provider: 'openai',
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    try {
      const hfResponse = await this.huggingfaceGenerate(prompt);
      responses.push(hfResponse);
    } catch (error) {
      responses.push({
        provider: 'huggingface',
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return responses;
  }

  // Image generation with HuggingFace
  static async generateImage(prompt: string): Promise<string> {
    try {
      const response = await hf.textToImage({
        model: 'runwayml/stable-diffusion-v1-5',
        inputs: prompt,
      });

      // Convert response to base64
      let buffer: Buffer;
      if (typeof response === 'object' && response !== null && 'arrayBuffer' in response) {
        // It's a Blob-like object
        buffer = Buffer.from(await (response as any).arrayBuffer());
      } else {
        // It's already a buffer or string
        buffer = Buffer.from(response);
      }
      const base64 = buffer.toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error(`Image generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
