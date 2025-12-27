import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { HelpComponent } from './components/help.component';
import { ChangelogComponent } from './components/changelog.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'changelog',
    component: ChangelogComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
