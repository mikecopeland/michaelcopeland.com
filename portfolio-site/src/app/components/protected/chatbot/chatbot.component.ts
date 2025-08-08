import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../services/chatbot.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    // Add welcome message
    this.messages.push({
      id: 'welcome',
      message: '',
      response: "Hello! I'm Michael's AI assistant. I can help you learn about his experience, skills, and projects. What would you like to know?",
      timestamp: new Date()
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const userMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    // Add user message to chat
    this.messages.push({
      id: Date.now().toString(),
      message: userMessage,
      response: '',
      timestamp: new Date()
    });

    // Get AI response from Lambda function
    this.chatbotService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.messages.push(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting response:', error);
        this.messages.push({
          id: Date.now().toString(),
          message: '',
          response: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages = [{
      id: 'welcome',
      message: '',
      response: "Hello! I'm Michael's AI assistant. I can help you learn about his experience, skills, and projects. What would you like to know?",
      timestamp: new Date()
    }];
  }
}

