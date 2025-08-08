# Portfolio Setup Guide

## 🚀 **Quick Setup**

Your portfolio is now configured to automatically pull data from your LinkedIn profile and GitHub repositories. Simply update the configuration file with your information!

## 📝 **Configuration Steps**

### 1. **Update Portfolio Configuration**

Edit the file: `src/app/config/portfolio.config.ts`

```typescript
export const PORTFOLIO_CONFIG = {
  // Your LinkedIn public profile URL
  linkedinUrl: 'https://www.linkedin.com/in/YOUR-LINKEDIN-USERNAME',
  
  // Your GitHub username
  githubUsername: 'YOUR-GITHUB-USERNAME',
  
  // Your personal information (fallback if LinkedIn fails)
  personalInfo: {
    name: 'Your Full Name',
    headline: 'Your Professional Title',
    location: 'Your Location',
    email: 'your.email@example.com',
    phone: '+1 (555) 123-4567',
    website: 'https://yourwebsite.com'
  },
  
  // Social media links
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/YOUR-LINKEDIN-USERNAME',
    github: 'https://github.com/YOUR-GITHUB-USERNAME',
    twitter: 'https://twitter.com/YOUR-TWITTER-USERNAME',
    instagram: 'https://instagram.com/YOUR-INSTAGRAM-USERNAME'
  }
};
```

### 2. **Replace Placeholder Values**

**LinkedIn:**
- Find your LinkedIn profile URL
- Format: `https://www.linkedin.com/in/your-username`
- Make sure your profile is public

**GitHub:**
- Use your GitHub username (not your full name)
- Format: `your-github-username` (without @)
- Ensure you have public repositories

**Personal Info:**
- Update with your actual information
- This serves as fallback if LinkedIn data fails to load

### 3. **Start the Development Server**

```bash
ng serve
```

Visit: http://localhost:4200

## 🎯 **What Gets Fetched**

### **From LinkedIn:**
- ✅ Professional experience and job history
- ✅ Education and certifications
- ✅ Skills and endorsements
- ✅ Profile summary and headline
- ✅ Location and contact info

### **From GitHub:**
- ✅ Repository names and descriptions
- ✅ Programming languages used
- ✅ Star and fork counts
- ✅ Last updated dates
- ✅ Direct repository links

## 🔧 **Example Configuration**

```typescript
export const PORTFOLIO_CONFIG = {
  linkedinUrl: 'https://www.linkedin.com/in/john-doe',
  githubUsername: 'johndoe',
  
  personalInfo: {
    name: 'John Doe',
    headline: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    website: 'https://johndoe.com'
  },
  
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/john-doe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    instagram: 'https://instagram.com/johndoe'
  }
};
```

## 🎨 **Customization Options**

### **Add Custom Projects**
You can add specific projects that don't appear on GitHub:

```typescript
customProjects: [
  {
    name: 'My Special Project',
    description: 'A custom project description',
    url: 'https://github.com/username/project',
    language: 'TypeScript',
    stars: 0,
    forks: 0,
    featured: true
  }
]
```

### **Update Styling**
- Colors: Edit `tailwind.config.js`
- Layout: Modify component templates
- Fonts: Update `src/styles.css`

## 🚀 **Deployment**

### **Build for Production**
```bash
ng build --configuration production
```

### **Deploy to S3**
```bash
aws s3 sync dist/portfolio-site s3://your-bucket-name --delete
```

## 🆘 **Troubleshooting**

### **LinkedIn Data Not Loading:**
- Ensure your LinkedIn profile is public
- Check the URL format is correct
- LinkedIn may block automated requests (normal for development)

### **GitHub Data Not Loading:**
- Verify your GitHub username is correct
- Ensure you have public repositories
- GitHub API has rate limits (60 requests/hour)

### **No Data Showing:**
- Check browser console for errors
- Verify configuration file syntax
- Fallback data should always show

## 🎉 **Benefits**

- **🔄 Always Current**: Updates automatically when you update LinkedIn/GitHub
- **⏰ Time Saving**: No manual content updates needed
- **🎨 Professional**: Consistent data across all platforms
- **🔒 Secure**: Only uses public data, respects privacy
- **📱 Responsive**: Works on all devices

Your portfolio will now automatically display your latest professional information! 🚀

