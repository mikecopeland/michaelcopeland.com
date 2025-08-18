import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { LoginTrackingService } from '../../../services/login-tracking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user$: Observable<any>;
  isAuthenticated$: Observable<boolean>;
  isOwner = false;

  constructor(
    public auth: AuthService,
    private loginTrackingService: LoginTrackingService
  ) {
    this.user$ = this.auth.user$;
    this.isAuthenticated$ = this.auth.isAuthenticated$;
  }

  ngOnInit(): void {
    // Initialize login tracking
    this.loginTrackingService.setupAutoTracking();
    
    // Check if current user is the owner
    this.user$.subscribe(user => {
      this.isOwner = user?.email === 'michael@michaelcopeland.com';
    });
  }

  logout(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  // Test function to manually track a login (for testing purposes)
  testLoginTracking(): void {
    this.user$.subscribe(user => {
      if (user) {
        console.log('Testing login tracking for user:', user);
        this.loginTrackingService.trackLogin(user).subscribe({
          next: (response) => {
            console.log('Login tracking test successful:', response);
            alert('Login tracking test successful! Check analytics.');
          },
          error: (error) => {
            console.error('Login tracking test failed:', error);
            alert('Login tracking test failed. Check console for details.');
          }
        });
      }
    });
  }
}



