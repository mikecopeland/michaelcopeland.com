import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { PortfolioDataService } from '../../../services/portfolio-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  config: any;
  isAuthenticated = false;
  isMobileMenuOpen = false;

  constructor(
    public auth: AuthService,
    private portfolioDataService: PortfolioDataService
  ) {
    this.config = this.portfolioDataService.getConfig();
  }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.auth.isAuthenticated$.subscribe(
      (isAuth: boolean) => this.isAuthenticated = isAuth
    );
  }

  login(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
