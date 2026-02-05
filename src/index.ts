// src/index.ts

export interface AssistantResponse {
  res: string;
  image: string | null;
  elementId: string | null;
  route: string | null;
}

export interface DoclessConfig {
  appKey: string;
  baseUrl?: string;
  timeout?: number; // Added for production reliability
}

export class DoclessClient {
  private appKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: DoclessConfig) {
    this.appKey = config.appKey;
    this.baseUrl = config.baseUrl || "http://localhost:3000/api/v1";
    this.timeout = config.timeout || 30000; // 30s default
  }

  /**
   * Send a query to the AI assistant
   */
  async ask(query: string): Promise<AssistantResponse> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        signal: controller.signal, // Handle timeouts
        headers: {
          "Content-Type": "application/json",
          "X-SDK-Name": "@doclessai/sdk", // Useful for your server logs
          "X-SDK-Version": "0.1.0",
        },
        body: JSON.stringify({
          appKey: this.appKey,
          query: query,
        }),
      });

      // Clear timeout if request succeeds
      clearTimeout(id);

      if (!response.ok) {
        // Try to get detailed error from your API
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.message || `DoclessAI Request failed with status ${response.status}`
        );
      }

      return (await response.json()) as AssistantResponse;
    } catch (error) {
      clearTimeout(id);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("DoclessAI Error: Request timed out.");
      }
      
      // Standardize the error for your users
      throw new Error(`DoclessAI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}