import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private isEnabled = false;

  constructor() {
    // Gemini service is disabled by default
    // To enable, set window.GEMINI_API_KEY in the browser console or configure via environment
    try {
      const apiKey = (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
                     '';
      
      if (apiKey && apiKey.trim() !== '') {
        this.ai = new GoogleGenAI({ apiKey });
        this.isEnabled = true;
      } else {
        console.log('Gemini service disabled: No API key provided');
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