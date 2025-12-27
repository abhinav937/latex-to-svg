import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { RateLimiterService, RateLimit } from './rate-limiter.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private isEnabled = false;
  private rateLimiter = inject(RateLimiterService);

  // Rate limits: 60 requests per minute for Gemini API
  private readonly GEMINI_RATE_LIMIT: RateLimit = {
    requests: 60,
    windowMs: 60 * 1000 // 1 minute
  };

  constructor() {
    // Gemini service is disabled by default
    // To enable, set window.GEMINI_API_KEY via environment configuration
    try {
      const apiKey = (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
                     '';
      
      if (apiKey && apiKey.trim() !== '' && apiKey !== '{{GEMINI_API_KEY}}') {
        this.ai = new GoogleGenAI({ apiKey });
        this.isEnabled = true;
      }
    } catch (error) {
      console.warn('Gemini service initialization failed:', error);
      this.isEnabled = false;
    }
  }

  async fixLatex(brokenLatex: string): Promise<string> {
    if (!this.isEnabled || !this.ai) {
      console.warn('Gemini service is not enabled. Please configure GEMINI_API_KEY.');
      return brokenLatex; // Return original if service unavailable
    }

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest('gemini', this.GEMINI_RATE_LIMIT)) {
      console.warn('Gemini API rate limit exceeded. Please wait before making another request.');
      return brokenLatex; // Return original if rate limited
    }

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `You are a LaTeX expert. Please fix the following LaTeX equation to be valid and renderable.
      Only return the corrected LaTeX code string. Do not include markdown code blocks, backticks, or explanations.

      Broken LaTeX:
      ${brokenLatex}`;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      const fixed = response.text ? response.text.trim() : '';
      // Remove any accidental markdown if the model hallucinates it despite instructions
      return fixed.replace(/^```latex/, '').replace(/^```/, '').replace(/```$/, '').trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return brokenLatex; // Return original on error
    }
  }

  async explainLatex(latex: string): Promise<string> {
    if (!this.isEnabled || !this.ai) {
      return 'Mathematical Expression';
    }

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest('gemini', this.GEMINI_RATE_LIMIT)) {
      console.warn('Gemini API rate limit exceeded for explanation.');
      return 'Mathematical Expression';
    }

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Explain what this LaTeX equation represents in simple math terms (e.g., "Quadratic Formula", "Integral of x squared"). Keep it very brief, under 20 words.

      LaTeX:
      ${latex}`;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text ? response.text.trim() : 'Complex Equation';
    } catch (error) {
      return 'Mathematical Expression';
    }
  }
}