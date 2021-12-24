export class TimeoutError extends Error {
  public timeout: number;

  constructor(timeout: number) {
    super(`timeout: ${timeout}ms`);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}