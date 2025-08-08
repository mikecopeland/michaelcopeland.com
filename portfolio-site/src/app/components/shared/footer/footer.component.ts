import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PORTFOLIO_CONFIG } from '../../../config/portfolio.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  config = PORTFOLIO_CONFIG;

  // Social media links with icons
  socialLinks = [
    {
      name: 'LinkedIn',
      url: this.config.socialLinks.linkedin,
      icon: 'linkedin',
      color: 'hover:text-blue-600'
    },
    {
      name: 'GitHub',
      url: this.config.socialLinks.github,
      icon: 'github',
      color: 'hover:text-gray-800'
    },
    {
      name: 'Twitter',
      url: this.config.socialLinks.twitter,
      icon: 'twitter',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      url: this.config.socialLinks.instagram,
      icon: 'instagram',
      color: 'hover:text-pink-500'
    }
  ];

  // Get current year
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
