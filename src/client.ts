export interface AssistantResponse {
  res: string;
  image: string | null;
  elementId: string | null;
  route: string | null;
}

export interface DoclessConfig {
  appKey: string;
  baseUrl?: string;
  timeout?: number; 
}

export class DoclessClient {
  private appKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: DoclessConfig) {
    this.appKey = config.appKey;
    this.baseUrl = config.baseUrl || "https://doclessai.vercel.app/api/v1";
    this.timeout = config.timeout || 30000;
  }

  async ask(query: string, file?: File): Promise<AssistantResponse> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const formData = new FormData();
      formData.append('appKey', this.appKey);
      formData.append('query', query);

      if (file) {
        formData.append('image', file);
      }

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "X-SDK-Name": "@doclessai/sdk",
          "X-SDK-Version": "0.2.1",
        },
        body: formData,
      });

      clearTimeout(id);

      if (!response.ok) {
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

      throw new Error(
        `DoclessAI Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
