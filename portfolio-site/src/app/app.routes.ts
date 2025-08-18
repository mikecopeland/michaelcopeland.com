import { Routes } from '@angular/router';
import { HomeComponent } from './components/public/home/home.component';
import { AboutComponent } from './components/public/about/about.component';
import { ProjectsComponent } from './components/public/projects/projects.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: { animation: 'home' } },
  { path: 'about', component: AboutComponent, data: { animation: 'about' } },
  { path: 'projects', component: ProjectsComponent, data: { animation: 'projects' } },
  { path: 'contact', component: ContactComponent, data: { animation: 'contact' } },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/protected/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { animation: 'dashboard' }
  },
  { 
    path: 'chatbot', 
    loadComponent: () => import('./components/protected/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [authGuard],
    data: { animation: 'chatbot' }
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./components/protected/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [authGuard],
    data: { animation: 'analytics' }
  },
  { path: '**', redirectTo: '/home' }
];
