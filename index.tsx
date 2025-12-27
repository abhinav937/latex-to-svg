
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppLayoutComponent } from './src/app-layout.component';
import { routes } from './src/app.routes';

bootstrapApplication(AppLayoutComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
