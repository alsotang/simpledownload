export class TimeoutError extends Error {
  public timeout: number;

  constructor(timeout: number) {
    super(`timeout: ${timeout}ms`);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

export class HttpStatusCodeError extends Error {
  public statusCode: number;
  public statusMessage?: string;
  public url: string;

  constructor(statusCode: number, statusMessage: string | undefined, url: string) {
    const message = statusMessage
      ? `unexpected status code: ${statusCode} ${statusMessage}`
      : `unexpected status code: ${statusCode}`;

    super(message);
    this.name = 'HttpStatusCodeError';
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    this.url = url;
  }
}
