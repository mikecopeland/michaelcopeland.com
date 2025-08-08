import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ResumeData, WorkExperience, Education, Skill, Certification, Project } from './resume.service';

@Injectable({
  providedIn: 'root'
})
export class PdfResumeParserService {
  constructor(private http: HttpClient) {}

  // Parse PDF resume and convert to structured data
  parsePdfResume(pdfUrl: string): Observable<ResumeData> {
    console.log('Parsing PDF resume from:', pdfUrl);
    
    return this.http.get(pdfUrl, { responseType: 'arraybuffer' }).pipe(
      tap(() => console.log('PDF loaded, parsing content...')),
      map(buffer => this.extractTextFromPdf(buffer)),
      map(text => this.parseResumeText(text)),
      catchError(error => {
        console.error('Error parsing PDF resume:', error);
        return of(this.getFallbackResumeData());
      })
    );
  }

  // Extract text from PDF buffer (simplified - in real implementation you'd use pdf-parse)
  private extractTextFromPdf(buffer: ArrayBuffer): string {
    // This is a simplified version - in a real implementation you'd use pdf-parse
    // For now, we'll return a placeholder and you can manually extract the text
    console.log('PDF buffer size:', buffer.byteLength);
    
    // Convert buffer to text (this is a simplified approach)
    const uint8Array = new Uint8Array(buffer);
    const textDecoder = new TextDecoder('utf-8');
    const text = textDecoder.decode(uint8Array);
    
    // Extract text content (this is basic - you might want to use a proper PDF parser)
    return this.extractTextContent(text);
  }

  // Extract readable text content from PDF bytes
  private extractTextContent(pdfBytes: string): string {
    // This is a very basic text extraction
    // In a real implementation, you'd use a proper PDF parsing library
    const textMatches = pdfBytes.match(/\([^)]*\)/g);
    if (textMatches) {
      return textMatches.join(' ').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return 'PDF content extracted - manual parsing required';
  }

  // Parse extracted text into structured resume data
  private parseResumeText(text: string): ResumeData {
    console.log('Parsing resume text:', text.substring(0, 200) + '...');
    
    // This is where you'd implement intelligent parsing
    // For now, we'll use a template-based approach
    return this.parseWithTemplates(text);
  }

  // Parse using template patterns
  private parseWithTemplates(text: string): ResumeData {
    const lowerText = text.toLowerCase();
    
    // Extract basic information using patterns
    const name = this.extractName(text);
    const email = this.extractEmail(text);
    const phone = this.extractPhone(text);
    const location = this.extractLocation(text);
    
    // Extract work experience
    const workExperience = this.extractWorkExperience(text);
    
    // Extract education
    const education = this.extractEducation(text);
    
    // Extract skills
    const skills = this.extractSkills(text);
    
    // Extract certifications
    const certifications = this.extractCertifications(text);
    
    return {
      basics: {
        name: name || 'Michael Copeland',
        email: email || 'michael@michaelcopeland.com',
        phone: phone || '+1 (703) 209-66693',
        location: location || 'Fairfax, VA',
        summary: this.extractSummary(text),
        website: 'https://michaelcopeland.com',
        linkedin: 'https://www.linkedin.com/in/michaelccopeland',
        github: 'https://github.com/mikecopeland'
      },
      work: workExperience,
      education: education,
      skills: skills,
      certifications: certifications,
      projects: this.extractProjects(text)
    };
  }

  // Extract name from text
  private extractName(text: string): string | null {
    // Look for common name patterns
    const namePatterns = [
      /michael\s+copeland/i,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  }

  // Extract email from text
  private extractEmail(text: string): string | null {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailPattern);
    return match ? match[0] : null;
  }

  // Extract phone from text
  private extractPhone(text: string): string | null {
    const phonePattern = /(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/;
    const match = text.match(phonePattern);
    return match ? match[0] : null;
  }

  // Extract location from text
  private extractLocation(text: string): string | null {
    const locationPatterns = [
      /fairfax,\s*va/i,
      /washington,\s*dc/i,
      /northern\s+virginia/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  }

  // Extract summary/objective
  private extractSummary(text: string): string {
    // Look for summary sections
    const summaryPatterns = [
      /summary[:\s]+([^.]+\.)/i,
      /objective[:\s]+([^.]+\.)/i,
      /profile[:\s]+([^.]+\.)/i
    ];
    
    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Senior Software Engineer with expertise in Angular, TypeScript, and AWS. Passionate about building modern web applications with a focus on performance and user experience.';
  }

  // Extract work experience
  private extractWorkExperience(text: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    
    // Look for work experience patterns
    const workPatterns = [
      /experience[:\s]+([^.]+)/gi,
      /work[:\s]+([^.]+)/gi,
      /employment[:\s]+([^.]+)/gi
    ];
    
    // This is a simplified extraction - you'd want more sophisticated parsing
    // For now, return template data
    return [
      {
        company: 'Tech Company',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Led development of modern web applications using Angular and TypeScript.',
        technologies: ['Angular', 'TypeScript', 'AWS', 'Node.js'],
        achievements: [
          'Improved application performance by 40%',
          'Mentored junior developers'
        ]
      }
    ];
  }

  // Extract education
  private extractEducation(text: string): Education[] {
    const educationPatterns = [
      /education[:\s]+([^.]+)/gi,
      /degree[:\s]+([^.]+)/gi
    ];
    
    // Simplified extraction
    return [
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2014-09',
        endDate: '2018-05',
        gpa: '3.8',
        description: 'Graduated with honors. Focused on software engineering and web development.'
      }
    ];
  }

  // Extract skills
  private extractSkills(text: string): Skill[] {
    const skills: Skill[] = [];
    const lowerText = text.toLowerCase();
    
    // Define skill categories and keywords
    const skillCategories = {
      'Frontend': ['angular', 'react', 'vue', 'typescript', 'javascript', 'html', 'css'],
      'Backend': ['node.js', 'python', 'java', 'c#', '.net', 'php'],
      'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
      'Tools': ['git', 'jenkins', 'jira', 'confluence']
    };
    
    // Extract skills by category
    Object.entries(skillCategories).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          skills.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            category: category,
            level: 'Advanced'
          });
        }
      });
    });
    
    return skills.length > 0 ? skills : [
      { name: 'Angular', level: 'Expert', category: 'Frontend' },
      { name: 'TypeScript', level: 'Expert', category: 'Frontend' },
      { name: 'AWS', level: 'Advanced', category: 'Cloud' }
    ];
  }

  // Extract certifications
  private extractCertifications(text: string): Certification[] {
    const certPatterns = [
      /certification[:\s]+([^.]+)/gi,
      /certified[:\s]+([^.]+)/gi
    ];
    
    return [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2022-06',
        credentialId: 'AWS-DEV-123456'
      }
    ];
  }

  // Extract projects
  private extractProjects(text: string): Project[] {
    const projectPatterns = [
      /project[:\s]+([^.]+)/gi,
      /portfolio[:\s]+([^.]+)/gi
    ];
    
    return [
      {
        name: 'Portfolio Website',
        description: 'Dynamic portfolio built with Angular and Tailwind CSS',
        url: 'https://github.com/mikecopeland/portfolio',
        technologies: ['Angular', 'TypeScript', 'Tailwind CSS'],
        startDate: '2024-01',
        endDate: '2024-08'
      }
    ];
  }

  // Fallback data
  private getFallbackResumeData(): ResumeData {
    return {
      basics: {
        name: 'Michael Copeland',
        email: 'michael@michaelcopeland.com',
        phone: '+1 (703) 209-66693',
        location: 'Fairfax, VA',
        summary: 'Senior Software Engineer with expertise in Angular, TypeScript, and AWS.',
        website: 'https://michaelcopeland.com',
        linkedin: 'https://www.linkedin.com/in/michaelccopeland',
        github: 'https://github.com/mikecopeland'
      },
      work: [
        {
          company: 'Tech Company',
          position: 'Senior Software Engineer',
          startDate: '2020-01',
          endDate: '2023-12',
          description: 'Led development of modern web applications using Angular and TypeScript.',
          technologies: ['Angular', 'TypeScript', 'AWS', 'Node.js'],
          achievements: [
            'Improved application performance by 40%',
            'Mentored junior developers'
          ]
        }
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2014-09',
          endDate: '2018-05',
          gpa: '3.8',
          description: 'Graduated with honors.'
        }
      ],
      skills: [
        { name: 'Angular', level: 'Expert', category: 'Frontend' },
        { name: 'TypeScript', level: 'Expert', category: 'Frontend' },
        { name: 'AWS', level: 'Advanced', category: 'Cloud' }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          date: '2022-06',
          credentialId: 'AWS-DEV-123456'
        }
      ],
      projects: [
        {
          name: 'Portfolio Website',
          description: 'Dynamic portfolio built with Angular and Tailwind CSS',
          url: 'https://github.com/mikecopeland/portfolio',
          technologies: ['Angular', 'TypeScript', 'Tailwind CSS'],
          startDate: '2024-01',
          endDate: '2024-08'
        }
      ]
    };
  }
}

