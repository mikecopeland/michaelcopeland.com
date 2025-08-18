import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginEvent {
  eventId: string;
  userId: string;
  email: string;
  name: string;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
  referer: string;
  eventType: string;
  // Additional browser data
  language?: string;
  platform?: string;
  screenResolution?: string;
  timezone?: string;
  url?: string;
}

export interface LoginAnalytics {
  totalLogins: number;
  uniqueUsers: number;
  recentLogins: number;
  topUsers: { [email: string]: number };
  loginHistory: LoginEvent[];
}

@Injectable({
  providedIn: 'root'
})
export class LoginTrackingService {
  private trackingApiUrl = 'https://u77wcxu48a.execute-api.us-east-1.amazonaws.com';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   * Track a user login event
   */
  trackLogin(userData: any): Observable<any> {
    const payload = {
      action: 'track_login',
      userData: {
        sub: userData.sub,
        email: userData.email,
        name: userData.name
      },
      // Add browser information
      browserData: {
        userAgent: navigator.userAgent,
        referer: document.referrer || 'Direct',
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        url: window.location.href
      }
    };

    return this.http.post(`${this.trackingApiUrl}/track`, payload).pipe(
      tap(response => console.log('Login tracked:', response)),
      catchError(error => {
        console.error('Error tracking login:', error);
        return of(null); // Don't fail the login if tracking fails
      })
    );
  }

  /**
   * Get login analytics
   */
  getAnalytics(): Observable<LoginAnalytics> {
    const payload = {
      action: 'get_analytics'
    };

    return this.http.post<LoginAnalytics>(`${this.trackingApiUrl}/analytics`, payload).pipe(
      catchError(error => {
        console.error('Error getting analytics:', error);
        return of({
          totalLogins: 0,
          uniqueUsers: 0,
          recentLogins: 0,
          topUsers: {},
          loginHistory: []
        });
      })
    );
  }

  /**
   * Auto-track login when user authenticates
   */
  setupAutoTracking(): void {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.trackLogin(user).subscribe();
      }
    });
  }

  /**
   * Update the API URL after deployment
   */
  updateApiUrl(newUrl: string): void {
    this.trackingApiUrl = newUrl;
  }
}
