import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkedInService } from '../../../services/linkedin.service';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PORTFOLIO_CONFIG } from '../../../config/portfolio.config';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  projects$: Observable<any[]>;

  constructor(private linkedinService: LinkedInService) {
    console.log('ProjectsComponent: Loading GitHub projects for:', PORTFOLIO_CONFIG.githubUsername);
    
    this.projects$ = this.linkedinService.getGitHubProjects(PORTFOLIO_CONFIG.githubUsername).pipe(
      tap(projects => console.log('ProjectsComponent: GitHub projects loaded:', projects)),
      catchError(error => {
        console.error('ProjectsComponent: Error loading GitHub projects:', error);
        // Return empty array if GitHub fails
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    console.log('ProjectsComponent: ngOnInit called');
  }

  // Helper method to get language color
  getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'C#': 'bg-purple-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-600',
      'Swift': 'bg-orange-600',
      'HTML': 'bg-orange-500',
      'CSS': 'bg-pink-500',
      'Shell': 'bg-green-600',
      'Dart': 'bg-blue-600',
      'Groovy': 'bg-green-700'
    };
    return colors[language] || 'bg-gray-500';
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
