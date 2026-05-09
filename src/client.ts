export interface MetaData {
  route: string | null;
  elementId: string | null;
}

export interface AskOptions {
  query: string;
  file?: File;

  onText?: (chunk: string) => void;

  onMeta?: (meta: MetaData) => void;

  onStatus?: (message: string) => void;

  onDone?: () => void;

  onError?: (message: string) => void;
}

export interface DoclessConfig {
  appKey: string;
  baseUrl?: string;
}

export class DoclessClient {
  private appKey: string;
  private baseUrl: string;

  constructor(config: DoclessConfig) {
    this.appKey = config.appKey;

    this.baseUrl = config.baseUrl || "https://doclessai.vercel.app/api/v1";
  }

  async ask(options: AskOptions): Promise<void> {
    const controller = new AbortController();
    let textBuffer = "";
    let flushTimeout: any = null;

    try {
      const formData = new FormData();

      formData.append("appKey", this.appKey);
      formData.append("query", options.query);

      if (options.file) {
        formData.append("image", options.file);
      }

      const response = await fetch(`https://doclessai.vercel.app/api/v2/chat`, {
        method: "POST",
        signal: controller.signal,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Empty response body");
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;

          const json = event.replace("data: ", "");

          try {
            const data = JSON.parse(json);

            switch (data.type) {
              case "text":
                textBuffer += data.chunk;

                if (!flushTimeout) {
                  flushTimeout = setTimeout(() => {
                    options.onText?.(textBuffer);

                    textBuffer = "";
                    flushTimeout = null;
                  }, 35);
                }

                break;

              case "meta":
                options.onMeta?.({
                  route: data.route,
                  elementId: data.elementId,
                });
                break;

              case "status":
                options.onStatus?.(data.message);
                break;

              case "done":
                if (flushTimeout) {
                  clearTimeout(flushTimeout);

                  options.onText?.(textBuffer);

                  textBuffer = "";
                  flushTimeout = null;
                }

                options.onDone?.();

                break;

              case "error":
                options.onError?.(data.message);
                break;
            }
          } catch (err) {
            console.error("Failed to parse SSE event:", err);
          }
        }
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        options.onError?.("Request was aborted");

        return;
      }

      options.onError?.(error?.message || "Unknown DoclessAI error");
    }
  }
}
