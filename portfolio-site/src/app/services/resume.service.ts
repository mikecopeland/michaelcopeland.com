import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { PdfResumeParserService } from './pdf-resume-parser.service';

export interface ResumeData {
  basics: {
    name: string;
    email: string;
    phone?: string;
    location: string;
    summary: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  work: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  projects?: Project[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies?: string[];
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface Skill {
  name: string;
  level?: string;
  category?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private readonly RESUME_PDF_PATH = '/assets/resume/Michael Copeland.pdf';
  private readonly RESUME_JSON_PATH = '/assets/resume/resume.json';

  constructor(
    private http: HttpClient,
    private pdfParser: PdfResumeParserService
  ) {}

  // Load resume data - load directly from embedded data
  loadResumeData(): Observable<ResumeData> {
    console.log('Loading resume data from embedded JSON...');
    
    // Return the actual resume data directly
    const resumeData: ResumeData = {
      basics: {
        name: "Michael Copeland, CSM",
        email: "michael@michaelcopeland.com",
        phone: "703.209.6693",
        location: "Fairfax, VA 22033",
        summary: "With my extensive background in software development, spanning the last 21 years, I have developed applications, full-stack, using languages from C# to Java and JavaScript (Node.JS). I bring an eagerness to learn new technologies and to apply new patterns to solve problems, always striving to stay atop the trends of the ever-changing world of software development.",
        website: "https://michaelcopeland.com",
        linkedin: "https://www.linkedin.com/in/michaelccopeland",
        github: "https://github.com/mikecopeland"
      },
      work: [
        {
          company: "GDIT Inc.",
          position: "Software Development Advisor",
          startDate: "2003-01",
          endDate: undefined,
          description: "Lead developer across multiple Spring MVC Applications with 21 years of experience in full-stack development. Responsible for modernizing applications and implementing new technologies.",
          technologies: ["Spring MVC", "Spring Boot", "Java", "JavaScript", "Node.js", "AWS", "Flutter", "Python", "Docker"],
          achievements: [
            "Led migration of URM data system for tracking unaccompanied minors' access to refugee benefits",
            "Modernized UI across screens to speed page load and standardize look and feel",
            "Developed service locator mobile application using Flutter for iOS and Android",
            "Built survey system for communication with refugees using AWS Lambda and DynamoDB",
            "Implemented JIRA workflows and scrum practices for development teams",
            "Served as Scrum Master across multiple Agile development teams"
          ]
        }
      ],
      education: [
        {
          institution: "University of Maryland, College Park",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "1999-09",
          endDate: "2003-05",
          gpa: undefined,
          description: "Graduated with Computer Science degree, focusing on software development and full-stack applications."
        }
      ],
      skills: [
        { name: "Java", level: "Expert", category: "Backend" },
        { name: "Spring MVC", level: "Expert", category: "Backend" },
        { name: "Spring Boot", level: "Expert", category: "Backend" },
        { name: "JavaScript", level: "Expert", category: "Frontend" },
        { name: "Node.js", level: "Advanced", category: "Backend" },
        { name: "Python", level: "Advanced", category: "Backend" },
        { name: "C#", level: "Advanced", category: "Backend" },
        { name: "Groovy", level: "Advanced", category: "Backend" },
        { name: "AWS", level: "Advanced", category: "Cloud" },
        { name: "Docker", level: "Advanced", category: "DevOps" },
        { name: "Flutter", level: "Intermediate", category: "Mobile" },
        { name: "jQuery", level: "Expert", category: "Frontend" },
        { name: "HTML", level: "Expert", category: "Frontend" },
        { name: "CSS", level: "Expert", category: "Frontend" },
        { name: "Git", level: "Expert", category: "Tools" },
        { name: "Jenkins", level: "Advanced", category: "DevOps" },
        { name: "JIRA", level: "Advanced", category: "Tools" },
        { name: "MySQL", level: "Advanced", category: "Database" },
        { name: "SQL Server", level: "Advanced", category: "Database" },
        { name: "REST/SOAP", level: "Expert", category: "Backend" }
      ],
      certifications: [
        {
          name: "Certified Scrum Master (CSM)",
          issuer: "Scrum Alliance",
          date: "2017-03",
          credentialId: "CSM-2017"
        }
      ],
      projects: [
        {
          name: "Refugee Arrivals Data System",
          description: "Migration of URM data system for tracking unaccompanied minors' access to refugee benefits to a separate Spring MVC application",
          url: undefined,
          technologies: ["Spring MVC", "Java", "AWS", "DynamoDB"],
          startDate: "2020-01",
          endDate: "2024-01"
        },
        {
          name: "Service Locator Mobile App",
          description: "Flutter application to allow location of refugee services via devices using iOS and Android",
          url: undefined,
          technologies: ["Flutter", "Dart", "Mobile Development"],
          startDate: "2022-01",
          endDate: "2023-12"
        },
        {
          name: "Survey System for Refugees",
          description: "Web application using Webpack and NodeJS to provide a fast-loading mobile responsive site for refugee communication",
          url: undefined,
          technologies: ["Node.js", "Webpack", "AWS S3", "Amazon Pinpoint"],
          startDate: "2021-06",
          endDate: "2023-06"
        },
        {
          name: "VA File Conversion Services",
          description: "Multiple Grails and AWS applications for maintaining shipping logistics and file scanning for the Department of Veteran Affairs",
          url: undefined,
          technologies: ["Grails", "AWS Lambda", "DynamoDB", "jQuery"],
          startDate: "2018-01",
          endDate: "2020-12"
        },
        {
          name: "Mailbox Zero",
          description: "Automated processing routines using UI Path and Tesseract OCR engine to process PDFs from email inboxes",
          url: undefined,
          technologies: ["UI Path", "Python", "Tesseract OCR", "AWS SNS"],
          startDate: "2019-01",
          endDate: "2021-12"
        },
        {
          name: "Vets.gov API",
          description: "Migration of Sprint applications to Spring Boot based microservices in AWS hosted architecture",
          url: undefined,
          technologies: ["Spring Boot", "AWS", "Docker", "Lambda", "API Gateway"],
          startDate: "2017-01",
          endDate: "2019-12"
        },
        {
          name: "eBenefits.va.gov",
          description: "Lead Front-End Developer and System Architect for EVSS project, incorporating responsive design and custom UI components",
          url: "https://www.ebenefits.va.gov",
          technologies: ["JavaScript", "jQuery", "Sass", "Grunt", "QUnit"],
          startDate: "2015-01",
          endDate: "2017-12"
        },
        {
          name: "Grants.gov",
          description: "Grails application to support grants management across multiple clients with business workflow system",
          url: "https://www.grants.gov",
          technologies: ["Grails", "Java", "XML", "Apache POI", "iText"],
          startDate: "2010-01",
          endDate: "2015-12"
        }
      ]
    };
    
    console.log('Resume data loaded successfully:', resumeData);
    return of(resumeData);
  }

  // Load from JSON file
  private loadFromJson(): Observable<ResumeData> {
    console.log('Loading resume data from JSON file...');
    return this.http.get<ResumeData>(this.RESUME_JSON_PATH).pipe(
      tap(data => console.log('Resume data loaded from JSON:', data)),
      catchError(error => {
        console.error('Error loading resume JSON:', error);
        throw error;
      })
    );
  }

  // Get work experience
  getWorkExperience(): Observable<WorkExperience[]> {
    return this.loadResumeData().pipe(
      map(data => data.work || [])
    );
  }

  // Get education
  getEducation(): Observable<Education[]> {
    return this.loadResumeData().pipe(
      map(data => data.education || [])
    );
  }

  // Get skills
  getSkills(): Observable<Skill[]> {
    return this.loadResumeData().pipe(
      map(data => data.skills || [])
    );
  }

  // Get certifications
  getCertifications(): Observable<Certification[]> {
    return this.loadResumeData().pipe(
      map(data => data.certifications || [])
    );
  }

  // Get projects
  getProjects(): Observable<Project[]> {
    return this.loadResumeData().pipe(
      map(data => data.projects || [])
    );
  }

  // Get basic info
  getBasicInfo(): Observable<ResumeData['basics']> {
    return this.loadResumeData().pipe(
      map(data => data.basics)
    );
  }

  // Fallback resume data
  private getFallbackResumeData(): ResumeData {
    return {
      basics: {
        name: 'Michael Copeland',
        email: 'michael@michaelcopeland.com',
        phone: '+1 (703) 209-66693',
        location: 'Fairfax, VA',
        summary: 'Senior Software Engineer with expertise in Angular, TypeScript, and AWS. Passionate about building modern web applications with a focus on performance and user experience.',
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
          description: 'Led development of modern web applications using Angular and TypeScript. Improved application performance by 40% and mentored junior developers.',
          technologies: ['Angular', 'TypeScript', 'AWS', 'Node.js', 'Docker'],
          achievements: [
            'Improved application performance by 40%',
            'Mentored 3 junior developers',
            'Led migration to microservices architecture'
          ]
        },
        {
          company: 'Startup Inc',
          position: 'Software Engineer',
          startDate: '2018-06',
          endDate: '2020-01',
          description: 'Built scalable web applications and implemented CI/CD pipelines. Collaborated with cross-functional teams to deliver high-quality software.',
          technologies: ['React', 'JavaScript', 'Docker', 'Git', 'Jenkins'],
          achievements: [
            'Implemented CI/CD pipeline reducing deployment time by 60%',
            'Built 5 new features with 100% test coverage'
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
          description: 'Graduated with honors. Focused on software engineering and web development.'
        }
      ],
      skills: [
        { name: 'Angular', level: 'Expert', category: 'Frontend' },
        { name: 'TypeScript', level: 'Expert', category: 'Frontend' },
        { name: 'React', level: 'Advanced', category: 'Frontend' },
        { name: 'JavaScript', level: 'Expert', category: 'Frontend' },
        { name: 'Node.js', level: 'Advanced', category: 'Backend' },
        { name: 'Python', level: 'Intermediate', category: 'Backend' },
        { name: 'AWS', level: 'Advanced', category: 'Cloud' },
        { name: 'Docker', level: 'Advanced', category: 'DevOps' },
        { name: 'Git', level: 'Expert', category: 'Tools' },
        { name: 'Jenkins', level: 'Intermediate', category: 'DevOps' }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          date: '2022-06',
          credentialId: 'AWS-DEV-123456'
        },
        {
          name: 'Angular Certification',
          issuer: 'Google',
          date: '2021-03',
          credentialId: 'ANG-2021-789'
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
        },
        {
          name: 'Appian Alexa Card Deck',
          description: 'Alexa skill for Appian card deck management',
          url: 'https://github.com/mikecopeland/AppianAlexaCardDeck',
          technologies: ['JavaScript', 'Alexa SDK', 'Node.js'],
          startDate: '2023-06',
          endDate: '2023-12'
        }
      ]
    };
  }
}
