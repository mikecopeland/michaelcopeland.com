import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PortfolioDataService } from '../../../services/portfolio-data.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit {
  configForm: FormGroup;
  isSaving = false;
  saveMessage = '';

  constructor(
    private fb: FormBuilder,
    private portfolioDataService: PortfolioDataService
  ) {
    this.configForm = this.fb.group({
      linkedinUrl: ['', [Validators.required, Validators.pattern('https://www.linkedin.com/in/.*')]],
      githubUsername: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]+$')]]
    });
  }

  ngOnInit(): void {
    // Load existing configuration from localStorage
    const savedConfig = localStorage.getItem('portfolioConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      this.configForm.patchValue(config);
    }
  }

  saveConfig(): void {
    if (this.configForm.valid) {
      this.isSaving = true;
      this.saveMessage = '';

      const config = this.configForm.value;
      
      // Save to localStorage
      localStorage.setItem('portfolioConfig', JSON.stringify(config));

      // Update portfolio data
      this.portfolioDataService.updateLinkedInUrl(config.linkedinUrl);
      this.portfolioDataService.updateGitHubUsername(config.githubUsername);

      this.isSaving = false;
      this.saveMessage = 'Configuration saved successfully! Data will refresh shortly.';
      
      // Clear message after 3 seconds
      setTimeout(() => {
        this.saveMessage = '';
      }, 3000);
    }
  }

  refreshData(): void {
    this.portfolioDataService.refreshData();
    this.saveMessage = 'Data refreshed!';
    
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }
}

