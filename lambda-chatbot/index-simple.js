// Simple Lambda function for portfolio chatbot
// Returns intelligent responses without external API dependencies

// Resume data for context
const RESUME_CONTEXT = {
    experience: "Michael has over 21 years of experience in software development, specializing in full-stack development with technologies like Angular, React, Node.js, Python, and AWS. He has worked on various projects including refugee assistance systems, mobile applications, and cloud-based solutions.",
    skills: "Michael's technical skills include: Frontend (Angular, React, TypeScript), Backend (Node.js, Python, Java), Cloud (AWS Lambda, S3, DynamoDB, CloudFront), and DevOps (Docker, CI/CD, GitHub Actions). He's also experienced with databases like PostgreSQL, MongoDB, and DynamoDB.",
    projects: "Some of Michael's notable projects include the Refugee Arrivals Data System, Service Locator Mobile App, Survey System for Refugees, and various web applications built with modern frameworks and deployed on AWS infrastructure.",
    education: "Michael has a strong Computer Science background and is a continuous learner who stays current with modern web technologies and best practices in software development.",
    contact: "Michael is available for software development opportunities and consulting. You can reach out to discuss potential projects or collaborations.",
    general: "Hello! I'm Michael's AI assistant. I can help you learn about his 21+ years of software development experience, technical skills including Angular, React, Node.js, Python, and AWS, as well as his various projects. What would you like to know more about?"
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: ''
        };
    }
    
    try {
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { message, userId = 'anonymous', sessionId = 'default' } = body;
        
        if (!message) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Message is required' })
            };
        }
        
        // Generate response based on message content
        const response = generateResponse(message);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: response,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Handler Error:', error);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: RESUME_CONTEXT.general,
                timestamp: new Date().toISOString()
            })
        };
    }
};

function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords and return appropriate responses
    if (lowerMessage.includes('experience') || lowerMessage.includes('background') || lowerMessage.includes('work') || lowerMessage.includes('career')) {
        return RESUME_CONTEXT.experience;
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech') || lowerMessage.includes('programming') || lowerMessage.includes('language')) {
        return RESUME_CONTEXT.skills;
    } else if (lowerMessage.includes('project') || lowerMessage.includes('portfolio') || lowerMessage.includes('work') || lowerMessage.includes('built')) {
        return RESUME_CONTEXT.projects;
    } else if (lowerMessage.includes('education') || lowerMessage.includes('learning') || lowerMessage.includes('school') || lowerMessage.includes('university')) {
        return RESUME_CONTEXT.education;
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('hire') || lowerMessage.includes('available')) {
        return RESUME_CONTEXT.contact;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! Thanks for your interest in Michael's background. " + RESUME_CONTEXT.general;
    } else if (lowerMessage.includes('aws') || lowerMessage.includes('cloud')) {
        return "Michael has extensive AWS experience including Lambda, S3, DynamoDB, CloudFront, API Gateway, and more. He's built and deployed numerous cloud-based applications and has expertise in cloud architecture and DevOps practices.";
    } else if (lowerMessage.includes('angular') || lowerMessage.includes('react') || lowerMessage.includes('frontend')) {
        return "Michael is highly skilled in modern frontend technologies including Angular, React, TypeScript, HTML/CSS, and Tailwind CSS. He has built responsive, user-friendly web applications and has experience with component-based architecture and state management.";
    } else if (lowerMessage.includes('node') || lowerMessage.includes('javascript') || lowerMessage.includes('backend')) {
        return "Michael has strong backend development skills with Node.js, Python, Java, and REST API development. He's experienced in building scalable server-side applications, microservices, and API integrations.";
    } else if (lowerMessage.includes('refugee') || lowerMessage.includes('humanitarian')) {
        return "Michael has worked on several humanitarian technology projects including the Refugee Arrivals Data System, Service Locator Mobile App, and Survey System for Refugees. These projects demonstrate his commitment to using technology for social good.";
    } else {
        // Default response with a hint about what to ask
        return "I'd be happy to tell you more about Michael's background! You can ask me about his experience, technical skills, projects, education, or how to contact him. What would you like to know?";
    }
}
