import { Injectable } from '@angular/core';

export interface RateLimit {
  requests: number;
  windowMs: number; // Time window in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  private requestHistory = new Map<string, number[]>();

  constructor() {}

  /**
   * Check if a request can be made for the given key
   * @param key - Unique identifier for the rate limit (e.g., 'gemini', 'codecogs')
   * @param limit - Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  canMakeRequest(key: string, limit: RateLimit): boolean {
    const now = Date.now();
    const history = this.requestHistory.get(key) || [];

    // Remove requests outside the time window
    const validRequests = history.filter(time => now - time < limit.windowMs);

    // Check if we're within the limit
    if (validRequests.length >= limit.requests) {
      return false;
    }

    // Add current request to history
    validRequests.push(now);
    this.requestHistory.set(key, validRequests);

    return true;
  }

  /**
   * Get the time until the next request can be made
   * @param key - Unique identifier for the rate limit
   * @param limit - Rate limit configuration
   * @returns milliseconds until next request is allowed, or 0 if allowed now
   */
  getTimeUntilNextRequest(key: string, limit: RateLimit): number {
    const now = Date.now();
    const history = this.requestHistory.get(key) || [];

    // Remove requests outside the time window
    const validRequests = history.filter(time => now - time < limit.windowMs);

    if (validRequests.length < limit.requests) {
      return 0; // Can make request now
    }

    // Find the oldest request in the current window
    const oldestRequest = Math.min(...validRequests);
    const nextAllowedTime = oldestRequest + limit.windowMs;

    return Math.max(0, nextAllowedTime - now);
  }

  /**
   * Wait until a request can be made
   * @param key - Unique identifier for the rate limit
   * @param limit - Rate limit configuration
   * @returns Promise that resolves when request can be made
   */
  async waitForNextRequest(key: string, limit: RateLimit): Promise<void> {
    const waitTime = this.getTimeUntilNextRequest(key, limit);
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}