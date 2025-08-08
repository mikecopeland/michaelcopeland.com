# Resume Data Extraction Template

Use this template to extract your actual resume data and update the JSON file.

## 📝 **Step-by-Step Process:**

### 1. **Basic Information**
Open your PDF resume and find:
- **Name**: 
- **Email**: 
- **Phone**: 
- **Location**: 
- **Summary/Objective**: (2-3 sentences about your professional background)

### 2. **Work Experience**
For each job, extract:
- **Company Name**: 
- **Position/Title**: 
- **Start Date**: (YYYY-MM format)
- **End Date**: (YYYY-MM format, or leave empty if current)
- **Description**: (2-3 sentences about your role)
- **Technologies Used**: (list of technologies, frameworks, tools)
- **Key Achievements**: (bullet points of accomplishments)

### 3. **Education**
- **Institution**: 
- **Degree**: 
- **Field of Study**: 
- **Start Date**: (YYYY-MM format)
- **End Date**: (YYYY-MM format)
- **GPA**: (if applicable)
- **Description**: (honors, focus areas, etc.)

### 4. **Skills**
Categorize your skills by:
- **Frontend**: Angular, React, TypeScript, JavaScript, HTML, CSS, etc.
- **Backend**: Node.js, Python, Java, C#, etc.
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes, etc.
- **Tools**: Git, Jenkins, Jira, etc.

For each skill, note:
- **Skill Name**: 
- **Level**: (Beginner, Intermediate, Advanced, Expert)
- **Category**: (Frontend, Backend, Cloud, Tools)

### 5. **Certifications**
- **Certification Name**: 
- **Issuing Organization**: 
- **Date Earned**: (YYYY-MM format)
- **Credential ID**: (if applicable)

### 6. **Projects**
- **Project Name**: 
- **Description**: (what the project does)
- **URL**: (GitHub link if available)
- **Technologies Used**: 
- **Start Date**: (YYYY-MM format)
- **End Date**: (YYYY-MM format)

## 🔄 **How to Update the JSON File:**

1. Open `src/assets/resume/resume.json`
2. Replace the template data with your actual information
3. Follow the exact JSON format
4. Save the file
5. The portfolio will automatically reload with your data

## 📊 **Example Format:**

```json
{
  "basics": {
    "name": "Your Actual Name",
    "email": "your.email@domain.com",
    "phone": "+1 (555) 123-4567",
    "location": "City, State",
    "summary": "Your actual professional summary from resume"
  },
  "work": [
    {
      "company": "Your Company Name",
      "position": "Your Job Title",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "description": "Your actual job description",
      "technologies": ["Angular", "TypeScript", "AWS"],
      "achievements": [
        "Specific achievement 1",
        "Specific achievement 2"
      ]
    }
  ]
}
```

## ✅ **Tips for Best Results:**

1. **Be specific** with dates (use YYYY-MM format)
2. **Include technologies** you actually used
3. **Quantify achievements** when possible
4. **Use consistent formatting** for dates and descriptions
5. **Test the portfolio** after updating to see the results

## 🚀 **Next Steps:**

1. Extract your data using this template
2. Update the JSON file with your information
3. Test the portfolio at http://localhost:4200
4. Refine the data as needed

Would you like me to help you with any specific section or create a more detailed template for your particular resume format?

