import { Routes } from '@angular/router';
import { HomeComponent } from './components/public/home/home.component';
import { AboutComponent } from './components/public/about/about.component';
import { ProjectsComponent } from './components/public/projects/projects.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'contact', component: ContactComponent },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/protected/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'chatbot', 
    loadComponent: () => import('./components/protected/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/home' }
];
