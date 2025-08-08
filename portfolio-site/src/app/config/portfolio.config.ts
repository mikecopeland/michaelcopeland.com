// Portfolio Configuration
// Update these values with your actual LinkedIn and GitHub information

export const PORTFOLIO_CONFIG = {
  // Your LinkedIn public profile URL
  // Format: https://www.linkedin.com/in/your-username
  linkedinUrl: 'https://www.linkedin.com/in/michaelccopeland',
  
  // Your GitHub username
  // Format: your-github-username (without @)
  githubUsername: 'mikecopeland',
  
  // Your personal information (fallback if LinkedIn fails)
  personalInfo: {
    name: 'Michael Copeland',
    headline: 'Senior Software Engineer',
    location: 'Fairfax, VA',
    email: 'michael@michaelcopeland.com',
    phone: '+1 (703) 209-6693',
    website: 'https://michaelcopeland.com'
  },
  
  // Social media links
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/michaelccopeland',
    github: 'https://github.com/mikecopeland',
    twitter: 'https://twitter.com/mikecopeland',
    instagram: 'https://instagram.com/mikecopeland_'
  },
  
  // Custom projects (if you want to add specific projects)
  customProjects: [
    {
      name: 'Portfolio Website',
      description: 'Dynamic portfolio built with Angular and Tailwind CSS',
      url: 'https://github.com/mikecopeland/portfolio',
      language: 'TypeScript',
      stars: 0,
      forks: 0,
      featured: true
    }
  ]
};
