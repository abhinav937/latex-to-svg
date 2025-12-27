import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterCreator?: string;
  twitterSite?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);

  private readonly defaultData: SEOData = {
    title: 'LaTeX to SVG Generator - Convert LaTeX Equations to SVG Instantly',
    description: 'Free online LaTeX to SVG converter with AI-powered syntax fixing. Create beautiful mathematical equations, formulas, and diagrams as SVG images. No installation required.',
    keywords: 'LaTeX, SVG, LaTeX to SVG, math equations, formula generator, SVG converter, mathematical notation, equation editor, TexText alternative, Inkscape',
    image: 'https://latex.cabhinav.com/assets/icons/share_preview.png',
    type: 'website',
    author: 'Abhinav Chinnusamy',
    twitterCard: 'summary_large_image',
    twitterCreator: '@abhinav_937',
    twitterSite: '@abhinav_937'
  };

  private readonly baseUrl = 'https://latex.cabhinav.com';

  updateSEO(data: Partial<SEOData> = {}): void {
    const seoData: SEOData = { ...this.defaultData, ...data };
    
    // Get current URL
    const currentUrl = seoData.url || `${this.baseUrl}${this.router.url}`;
    
    // Update title
    if (seoData.title) {
      this.title.setTitle(seoData.title);
    }

    // Basic meta tags
    this.updateMetaTag('description', seoData.description || '');
    this.updateMetaTag('keywords', seoData.keywords || '');
    this.updateMetaTag('author', seoData.author || '');
    this.updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph tags
    this.updateMetaTag('og:title', seoData.title || '', 'property');
    this.updateMetaTag('og:description', seoData.description || '', 'property');
    this.updateMetaTag('og:image', seoData.image || '', 'property');
    this.updateMetaTag('og:image:alt', seoData.title || '', 'property');
    this.updateMetaTag('og:url', currentUrl, 'property');
    this.updateMetaTag('og:type', seoData.type || 'website', 'property');
    this.updateMetaTag('og:site_name', 'LaTeX to SVG Generator', 'property');
    this.updateMetaTag('og:locale', 'en_US', 'property');

    // Twitter Card tags
    this.updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    this.updateMetaTag('twitter:title', seoData.title || '');
    this.updateMetaTag('twitter:description', seoData.description || '');
    this.updateMetaTag('twitter:image', seoData.image || '');
    if (seoData.twitterCreator) {
      this.updateMetaTag('twitter:creator', seoData.twitterCreator);
    }
    if (seoData.twitterSite) {
      this.updateMetaTag('twitter:site', seoData.twitterSite);
    }

    // Canonical URL
    this.updateLinkTag('canonical', currentUrl);

    // Additional SEO tags
    this.updateMetaTag('theme-color', '#00695c');
    this.updateMetaTag('apple-mobile-web-app-capable', 'yes');
    this.updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    this.updateMetaTag('apple-mobile-web-app-title', 'LaTeX SVG');
  }

  private updateMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name'): void {
    if (content) {
      const selector = attr === 'property' ? `property="${name}"` : `name="${name}"`;
      const existingTag = this.meta.getTag(selector);
      
      if (existingTag) {
        this.meta.updateTag({ [attr]: name, content });
      } else {
        this.meta.addTag({ [attr]: name, content });
      }
    }
  }

  private updateLinkTag(rel: string, href: string): void {
    // Remove existing canonical link if present
    const existingLink = document.querySelector(`link[rel="${rel}"]`);
    if (existingLink) {
      existingLink.remove();
    }
    
    // Add new canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    document.head.appendChild(link);
  }

  addStructuredData(data: object): void {
    // Remove existing structured data script if present
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  getDefaultStructuredData(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'LaTeX to SVG Generator',
      'url': this.baseUrl,
      'description': 'Free online LaTeX to SVG converter with AI-powered syntax fixing. Create beautiful mathematical equations, formulas, and diagrams as SVG images.',
      'applicationCategory': 'UtilityApplication',
      'operatingSystem': 'Web',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'creator': {
        '@type': 'Person',
        'name': 'Abhinav Chinnusamy',
        'url': 'https://cabhinav.com'
      },
      'featureList': [
        'Convert LaTeX to SVG',
        'AI-powered syntax fixing',
        'Real-time preview',
        'History management',
        'Export SVG files',
        'No installation required'
      ]
    };
  }
}
