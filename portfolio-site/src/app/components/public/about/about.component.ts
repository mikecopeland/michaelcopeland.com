import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService } from '../../../services/portfolio-data.service';
import { ResumeService, WorkExperience, Education, Skill, Certification } from '../../../services/resume.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  profile$: Observable<any>;
  experience$: Observable<WorkExperience[]>;
  education$: Observable<Education[]>;
  skills$: Observable<Skill[]>;
  certifications$: Observable<Certification[]>;

  constructor(
    private portfolioDataService: PortfolioDataService,
    private resumeService: ResumeService
  ) {
    console.log('AboutComponent: Initializing observables...');
    
    this.profile$ = this.portfolioDataService.getProfile().pipe(
      tap(profile => console.log('AboutComponent: Profile loaded:', profile))
    );
    
    this.experience$ = this.resumeService.getWorkExperience().pipe(
      tap(experience => console.log('AboutComponent: Experience loaded:', experience))
    );
    
    this.education$ = this.resumeService.getEducation().pipe(
      tap(education => console.log('AboutComponent: Education loaded:', education))
    );
    
    this.skills$ = this.resumeService.getSkills().pipe(
      tap(skills => console.log('AboutComponent: Skills loaded:', skills))
    );
    
    this.certifications$ = this.resumeService.getCertifications().pipe(
      tap(certifications => console.log('AboutComponent: Certifications loaded:', certifications))
    );
  }

  ngOnInit(): void {
    console.log('AboutComponent: ngOnInit called');
    // Data is automatically loaded by the service
  }

  // Helper method to get skill category
  getSkillCategory(skills: Skill[]): { [key: string]: Skill[] } {
    console.log('AboutComponent: Categorizing skills:', skills);
    const categories: { [key: string]: Skill[] } = {};
    
    skills.forEach(skill => {
      const category = skill.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(skill);
    });
    
    console.log('AboutComponent: Skill categories:', categories);
    return categories;
  }

  // Helper method to format date range
  formatDateRange(startDate: string, endDate?: string): string {
    const start = new Date(startDate);
    const startYear = start.getFullYear();
    
    if (!endDate) {
      return `${startYear} - Present`;
    }
    
    const end = new Date(endDate);
    const endYear = end.getFullYear();
    
    return `${startYear} - ${endYear}`;
  }
}
