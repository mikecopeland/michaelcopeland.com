import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

export interface LambdaChatResponse {
  response: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // Lambda API Gateway URL from environment
  private lambdaUrl = environment.chatbotApiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatMessage> {
    const payload = {
      message: message,
      userId: 'portfolio-user', // You can get this from Auth0 user
      sessionId: Date.now().toString()
    };

    return this.http.post<LambdaChatResponse>(this.lambdaUrl, payload)
      .pipe(
        map(response => ({
          id: Date.now().toString(),
          message: message,
          response: response.response,
          timestamp: new Date(response.timestamp)
        })),
        catchError(error => {
          console.error('Lambda API error:', error);
          console.log('Error status:', error.status);
          console.log('Error message:', error.message);
          
          // Provide a more informative fallback response
          const fallbackResponse = {
            id: Date.now().toString(),
            message: message,
            response: "I'm temporarily unavailable due to a technical issue. Please try again in a moment, or feel free to contact Michael directly for information about his experience and projects.",
            timestamp: new Date()
          };
          
          return of(fallbackResponse);
        })
      );
  }

  getChatHistory(): Observable<ChatMessage[]> {
    // For now, return empty array. You can implement this later with DynamoDB query
    return of([]);
  }

  // Mock response for development (remove when API is ready)
  getMockResponse(message: string): Observable<ChatMessage> {
    const mockResponses = [
      "I'm Michael's AI assistant! I can help you learn about his experience, skills, and projects. What would you like to know?",
      "Michael has over 21 years of experience in software development, specializing in Java, Spring, JavaScript, and AWS.",
      "Some of Michael's key projects include the Refugee Arrivals Data System, Service Locator Mobile App, and Survey System for Refugees.",
      "Michael is a Certified Scrum Master (CSM) and has led multiple Agile development teams.",
      "His technical skills include Java, Spring MVC, JavaScript, Node.js, AWS, Flutter, Python, and Docker."
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          id: Date.now().toString(),
          message: message,
          response: randomResponse,
          timestamp: new Date()
        });
        observer.complete();
      }, 1000); // Simulate API delay
    });
  }
}
