import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ResumeService, ResumeData, WorkExperience, Education, Skill, Certification, Project } from './resume.service';
import { LinkedInService } from './linkedin.service';
import { PORTFOLIO_CONFIG } from '../config/portfolio.config';

export interface PortfolioData {
  profile: {
    name: string;
    headline: string;
    summary: string;
    location: string;
    email: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  projects: any[];
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {
  private dataSubject = new BehaviorSubject<PortfolioData | null>(null);
  public data$ = this.dataSubject.asObservable();

  constructor(
    private resumeService: ResumeService,
    private linkedinService: LinkedInService
  ) {
    this.loadPortfolioData();
  }

  // Load portfolio data from resume and GitHub
  loadPortfolioData(): void {
    console.log('Loading portfolio data from resume service...');
    console.log('GitHub Username:', PORTFOLIO_CONFIG.githubUsername);
    
    // Load resume data (this will be the primary source)
    this.resumeService.loadResumeData().pipe(
      tap(resumeData => console.log('Resume data loaded:', resumeData)),
      map(resumeData => {
        // Create portfolio data from resume
        return {
          profile: {
            name: resumeData.basics.name,
            headline: resumeData.basics.summary.split('.')[0] + '.',
            summary: resumeData.basics.summary,
            location: resumeData.basics.location,
            email: resumeData.basics.email,
            website: resumeData.basics.website,
            linkedin: resumeData.basics.linkedin,
            github: resumeData.basics.github
          },
          projects: resumeData.projects || [],
          lastUpdated: new Date()
        };
      })
    ).subscribe({
      next: (data) => {
        console.log('Portfolio data loaded successfully:', data);
        this.dataSubject.next(data);
      },
      error: (error) => {
        console.error('Error loading portfolio data:', error);
        this.loadFallbackData();
      }
    });
  }

  // Get profile data
  getProfile(): Observable<any> {
    return this.data$.pipe(
      map(data => data?.profile || null)
    );
  }

  // Get projects
  getProjects(): Observable<any[]> {
    return this.data$.pipe(
      map(data => data?.projects || [])
    );
  }

  // Get work experience from resume
  getExperience(): Observable<WorkExperience[]> {
    return this.resumeService.getWorkExperience();
  }

  // Get education from resume
  getEducation(): Observable<Education[]> {
    return this.resumeService.getEducation();
  }

  // Get skills from resume
  getSkills(): Observable<Skill[]> {
    return this.resumeService.getSkills();
  }

  // Get certifications from resume
  getCertifications(): Observable<Certification[]> {
    return this.resumeService.getCertifications();
  }

  // Get configuration
  getConfig() {
    return PORTFOLIO_CONFIG;
  }

  // Refresh data
  refreshData(): void {
    this.loadPortfolioData();
  }

  // Load fallback data when external APIs fail
  private loadFallbackData(): void {
    console.log('Loading fallback data...');
    const fallbackData = {
      profile: {
        name: 'Michael Copeland',
        headline: 'Senior Software Engineer',
        summary: 'Experienced software engineer specializing in Angular, TypeScript, and AWS.',
        location: 'Fairfax, VA',
        email: 'michael@michaelcopeland.com',
        website: 'https://michaelcopeland.com',
        linkedin: 'https://www.linkedin.com/in/michaelccopeland',
        github: 'https://github.com/mikecopeland'
      },
      projects: [
        {
          name: 'Portfolio Website',
          description: 'Dynamic portfolio built with Angular and Tailwind CSS',
          url: 'https://github.com/mikecopeland/portfolio',
          language: 'TypeScript',
          stars: 0,
          forks: 0,
          updated: new Date().toISOString(),
          source: 'fallback'
        }
      ],
      lastUpdated: new Date()
    };
    
    this.dataSubject.next(fallbackData);
  }
}
