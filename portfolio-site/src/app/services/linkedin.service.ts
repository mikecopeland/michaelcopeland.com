import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  location: string;
  profilePicture?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  credentialId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LinkedInService {
  private readonly LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
  private readonly PROXY_URL = 'https://api.allorigins.win/raw?url=';

  constructor(private http: HttpClient) {}

  // Method to fetch profile data using LinkedIn API (requires OAuth)
  getProfileData(accessToken: string): Observable<LinkedInProfile> {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    return this.http.get(`${this.LINKEDIN_API_BASE}/me`, { headers }).pipe(
      map((response: any) => this.transformProfileData(response)),
      catchError(error => {
        console.error('Error fetching LinkedIn data:', error);
        return of(this.getFallbackData());
      })
    );
  }

  // Method to fetch profile data using public profile URL (scraping approach)
  getProfileFromUrl(profileUrl: string): Observable<LinkedInProfile> {
    console.log('Attempting to fetch LinkedIn profile from:', profileUrl);
    const encodedUrl = encodeURIComponent(profileUrl);
    const proxyUrl = `${this.PROXY_URL}${encodedUrl}`;
    console.log('Using proxy URL:', proxyUrl);
    
    return this.http.get(proxyUrl, { responseType: 'text' }).pipe(
      tap(html => console.log('LinkedIn HTML received, length:', html.length)),
      map(html => this.parseLinkedInHTML(html)),
      catchError(error => {
        console.error('Error fetching LinkedIn profile:', error);
        console.log('Returning fallback data');
        return of(this.getFallbackData());
      })
    );
  }

  // Parse LinkedIn HTML to extract profile data
  private parseLinkedInHTML(html: string): LinkedInProfile {
    // This is a simplified parser - in production you'd want a more robust solution
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const name = doc.querySelector('h1')?.textContent?.trim() || 'Michael Copeland';
    const headline = doc.querySelector('.text-body-medium')?.textContent?.trim() || 'Senior Software Engineer';
    
    // Extract experience from the experience section
    const experienceElements = doc.querySelectorAll('[data-section="experience"] .pvs-list__item');
    const experience: Experience[] = Array.from(experienceElements).map(el => ({
      title: el.querySelector('.pvs-entity__path-node')?.textContent?.trim() || '',
      company: el.querySelector('.pvs-entity__path-node + span')?.textContent?.trim() || '',
      duration: el.querySelector('.pvs-entity__caption-wrapper')?.textContent?.trim() || '',
      description: el.querySelector('.pvs-list__outer-container')?.textContent?.trim() || '',
      skills: []
    }));

    // Extract education
    const educationElements = doc.querySelectorAll('[data-section="education"] .pvs-list__item');
    const education: Education[] = Array.from(educationElements).map(el => ({
      degree: el.querySelector('.pvs-entity__path-node')?.textContent?.trim() || '',
      institution: el.querySelector('.pvs-entity__path-node + span')?.textContent?.trim() || '',
      year: el.querySelector('.pvs-entity__caption-wrapper')?.textContent?.trim() || '',
      description: el.querySelector('.pvs-list__outer-container')?.textContent?.trim() || ''
    }));

    return {
      name,
      headline,
      summary: doc.querySelector('.pv-shared-text-with-see-more')?.textContent?.trim() || '',
      location: doc.querySelector('.text-body-small')?.textContent?.trim() || '',
      experience,
      education,
      skills: [],
      certifications: []
    };
  }

  // Transform LinkedIn API response
  private transformProfileData(apiResponse: any): LinkedInProfile {
    return {
      name: apiResponse.localizedFirstName + ' ' + apiResponse.localizedLastName,
      headline: apiResponse.headline || '',
      summary: apiResponse.summary || '',
      location: apiResponse.location?.name || '',
      profilePicture: apiResponse.profilePicture?.displayImage || '',
      experience: apiResponse.positions?.elements?.map((pos: any) => ({
        title: pos.title,
        company: pos.companyName,
        duration: `${pos.startDate?.year} - ${pos.endDate?.year || 'Present'}`,
        description: pos.summary || '',
        skills: []
      })) || [],
      education: apiResponse.education?.elements?.map((edu: any) => ({
        degree: edu.degreeName,
        institution: edu.schoolName,
        year: edu.endDate?.year?.toString() || '',
        description: edu.description || ''
      })) || [],
      skills: apiResponse.skills?.elements?.map((skill: any) => skill.name) || [],
      certifications: apiResponse.certifications?.elements?.map((cert: any) => ({
        name: cert.name,
        issuer: cert.issuingOrganization,
        year: cert.issueDate?.year?.toString() || '',
        credentialId: cert.credentialId
      })) || []
    };
  }

  // Fallback data if API/scraping fails
  private getFallbackData(): LinkedInProfile {
    return {
      name: 'Michael Copeland',
      headline: 'Senior Software Engineer',
      summary: 'Experienced software engineer specializing in Angular, TypeScript, and AWS. Passionate about building modern web applications with a focus on performance and user experience.',
      location: 'San Francisco, CA',
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Company',
          duration: '2020 - 2023',
          description: 'Led development of modern web applications using Angular and TypeScript. Improved application performance by 40% and mentored junior developers.',
          skills: ['Angular', 'TypeScript', 'AWS', 'Node.js']
        },
        {
          title: 'Software Engineer',
          company: 'Startup Inc',
          duration: '2018 - 2020',
          description: 'Built scalable web applications and implemented CI/CD pipelines. Collaborated with cross-functional teams to deliver high-quality software.',
          skills: ['React', 'JavaScript', 'Docker', 'Git']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          year: '2018',
          description: 'Graduated with honors. Focused on software engineering and web development.'
        }
      ],
      skills: ['Angular', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'JavaScript', 'Python', 'Java'],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          year: '2022',
          credentialId: 'AWS-DEV-123456'
        },
        {
          name: 'Angular Certification',
          issuer: 'Google',
          year: '2021',
          credentialId: 'ANG-2021-789'
        }
      ]
    };
  }

  // Method to get projects from GitHub (alternative data source)
  getGitHubProjects(username: string): Observable<any[]> {
    console.log('Fetching GitHub projects for username:', username);
    const apiUrl = `https://api.github.com/users/${username}/repos`;
    console.log('GitHub API URL:', apiUrl);
    
    return this.http.get<any[]>(apiUrl).pipe(
      tap(repos => console.log('GitHub repos received:', repos.length, 'repositories')),
      map((repos: any[]) => repos
        .filter(repo => !repo.fork && repo.description)
        .map(repo => ({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated: repo.updated_at
        }))
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 6)
      ),
      tap(filteredRepos => console.log('Filtered projects:', filteredRepos)),
      catchError(error => {
        console.error('Error fetching GitHub projects:', error);
        console.log('Returning empty projects array');
        return of([]);
      })
    );
  }
}
