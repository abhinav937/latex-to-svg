import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { SEOService } from './services/seo.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header></app-header>
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `
})
export class AppLayoutComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SEOService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Set default SEO on initialization
    this.seoService.updateSEO();
    this.seoService.addStructuredData(this.seoService.getDefaultStructuredData());

    // Update SEO on route changes (auto-cleanup on destroy)
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateSEOForRoute();
      });
  }

  private updateSEOForRoute(): void {
    const url = this.router.url;
    
    switch (url) {
      case '/help':
        this.seoService.updateSEO({
          title: 'LaTeX to SVG Generator - Help & Documentation',
          description: 'Learn how to use the LaTeX to SVG Generator to create SVG images from LaTeX code. Comprehensive help documentation with examples and tutorials.',
          keywords: 'LaTeX help, SVG tutorial, LaTeX examples, math equations guide, LaTeX documentation',
          url: 'https://latex.cabhinav.com/help'
        });
        this.seoService.addStructuredData({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'LaTeX to SVG Generator - Help',
          'url': 'https://latex.cabhinav.com/help',
          'description': 'A help page explaining how to use the LaTeX to SVG Generator to create SVG images from LaTeX code.',
          'isPartOf': {
            '@type': 'WebApplication',
            'name': 'LaTeX to SVG Generator',
            'url': 'https://latex.cabhinav.com'
          }
        });
        break;
      
      case '/changelog':
        this.seoService.updateSEO({
          title: 'LaTeX to SVG Generator - Changelog',
          description: 'View the latest updates, features, and improvements to the LaTeX to SVG Generator. Stay informed about new capabilities and bug fixes.',
          keywords: 'LaTeX SVG changelog, updates, new features, release notes',
          url: 'https://latex.cabhinav.com/changelog'
        });
        this.seoService.addStructuredData({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'LaTeX to SVG Generator - Changelog',
          'url': 'https://latex.cabhinav.com/changelog',
          'description': 'Changelog and release notes for the LaTeX to SVG Generator.'
        });
        break;
      
      case '/404':
        this.seoService.updateSEO({
          title: '404 - Page Not Found | LaTeX to SVG Generator',
          description: 'The page you are looking for could not be found. Return to the LaTeX to SVG Generator homepage.',
          keywords: '404, page not found, error',
          url: 'https://latex.cabhinav.com/404'
        });
        break;
      
      default:
        // Check if it's a 404 route (wildcard match)
        if (url !== '/') {
          this.seoService.updateSEO({
            title: '404 - Page Not Found | LaTeX to SVG Generator',
            description: 'The page you are looking for could not be found. Return to the LaTeX to SVG Generator homepage.',
            keywords: '404, page not found, error',
            url: 'https://latex.cabhinav.com' + url
          });
        } else {
          // Home page
          this.seoService.updateSEO();
          this.seoService.addStructuredData(this.seoService.getDefaultStructuredData());
        }
        break;
    }
  }
}
