import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginTrackingService, LoginAnalytics } from '../../../services/login-tracking.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Login Activity</h1>
              <p class="text-gray-600">Track your portfolio access history</p>
            </div>
            <button 
              (click)="refresh()" 
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Your Total Logins</p>
                <p class="text-2xl font-semibold text-gray-900">{{ filteredAnalytics.totalLogins }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">This Week</p>
                <p class="text-2xl font-semibold text-gray-900">{{ filteredAnalytics.recentLogins }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Last Login</p>
                <p class="text-lg font-semibold text-gray-900">{{ lastLoginTime }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Login Summary -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Login Summary</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Login Frequency</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Today:</span>
                  <span class="font-medium">{{ getLoginsForPeriod('today') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">This Week:</span>
                  <span class="font-medium">{{ getLoginsForPeriod('week') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">This Month:</span>
                  <span class="font-medium">{{ getLoginsForPeriod('month') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">This Year:</span>
                  <span class="font-medium">{{ getLoginsForPeriod('year') }}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Device Information</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Most Used Device:</span>
                  <span class="font-medium">{{ mostUsedDevice }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Most Used Browser:</span>
                  <span class="font-medium">{{ mostUsedBrowser }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Most Used IP:</span>
                  <span class="font-medium">{{ mostUsedIP }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Users Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Top Portfolio Visitors</h2>
            <div class="text-right">
              <p class="text-sm text-gray-500">Total Visitors</p>
              <p class="text-2xl font-bold text-blue-600">{{ analytics.uniqueUsers }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div *ngFor="let user of topUsersArray; let i = index" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {{ i + 1 }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ user.name || 'Unknown User' }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ user.logins }}</p>
                <p class="text-sm text-gray-500">{{ user.logins === 1 ? 'login' : 'logins' }}</p>
              </div>
            </div>
            
            <!-- Empty State for Top Users -->
            <div *ngIf="topUsersArray.length === 0" class="text-center py-8">
              <div class="text-gray-400 mb-4">
                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <p class="text-gray-500">No visitors yet. Share your portfolio to start seeing analytics!</p>
            </div>
          </div>
        </div>

        <!-- Recent Login History -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Recent Login History</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device/Browser</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let event of filteredAnalytics.loginHistory" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(event.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div class="font-medium">{{ event.name || 'Unknown User' }}</div>
                      <div class="text-xs text-gray-500">{{ event.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ event.ipAddress }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {{ getDeviceInfo(event.userAgent) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {{ event.referer || 'Direct' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    <div class="space-y-1">
                      <div *ngIf="event.language && event.language !== 'unknown'">
                        <span class="font-medium">Language:</span> {{ event.language }}
                      </div>
                      <div *ngIf="event.platform && event.platform !== 'unknown'">
                        <span class="font-medium">Platform:</span> {{ event.platform }}
                      </div>
                      <div *ngIf="event.screenResolution && event.screenResolution !== 'unknown'">
                        <span class="font-medium">Screen:</span> {{ event.screenResolution }}
                      </div>
                      <div *ngIf="event.timezone && event.timezone !== 'unknown'">
                        <span class="font-medium">Timezone:</span> {{ event.timezone }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="filteredAnalytics.loginHistory.length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p class="text-gray-500">No login history found for your account.</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Loading your login data...</span>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading your login data</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsComponent implements OnInit {
  private readonly USER_EMAIL = 'michael@michaelcopeland.com';
  
  analytics: LoginAnalytics = {
    totalLogins: 0,
    uniqueUsers: 0,
    recentLogins: 0,
    topUsers: {},
    loginHistory: []
  };
  
  filteredAnalytics: LoginAnalytics = {
    totalLogins: 0,
    uniqueUsers: 0,
    recentLogins: 0,
    topUsers: {},
    loginHistory: []
  };
  
  loading = false;
  error: string | null = null;
  lastLoginTime = 'Never';
  mostUsedDevice = 'Unknown';
  mostUsedBrowser = 'Unknown';
  mostUsedIP = 'Unknown';
  topUsersArray: Array<{email: string, name: string, logins: number}> = [];

  constructor(private loginTrackingService: LoginTrackingService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    console.log('Loading analytics data...');
    this.loginTrackingService.getAnalytics().subscribe({
      next: (data) => {
        console.log('Analytics data received:', data);
        this.analytics = data;
        this.filterUserData();
        this.calculateUserStats();
        this.processTopUsers();
        this.loading = false;
        console.log('Filtered analytics for user:', this.filteredAnalytics);
      },
      error: (err) => {
        console.error('Analytics error:', err);
        this.error = 'Failed to load your login data';
        this.loading = false;
      }
    });
  }

  filterUserData(): void {
    // Filter login history to only show user's data
    const userLogins = this.analytics.loginHistory.filter(
      event => event.email === this.USER_EMAIL
    );

    this.filteredAnalytics = {
      totalLogins: userLogins.length,
      uniqueUsers: 1, // Always 1 for personal data
      recentLogins: this.getLoginsForPeriod('week'),
      topUsers: { [this.USER_EMAIL]: userLogins.length },
      loginHistory: userLogins.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  }

  calculateUserStats(): void {
    if (this.filteredAnalytics.loginHistory.length > 0) {
      // Last login time
      const lastLogin = this.filteredAnalytics.loginHistory[0];
      this.lastLoginTime = this.formatDate(lastLogin.timestamp);

      // Most used device/browser/IP
      const deviceCounts: { [key: string]: number } = {};
      const browserCounts: { [key: string]: number } = {};
      const ipCounts: { [key: string]: number } = {};

      this.filteredAnalytics.loginHistory.forEach(event => {
        const device = this.getDeviceType(event.userAgent);
        const browser = this.getBrowserType(event.userAgent);
        
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
      });

      this.mostUsedDevice = this.getMostUsed(deviceCounts);
      this.mostUsedBrowser = this.getMostUsed(browserCounts);
      this.mostUsedIP = this.getMostUsed(ipCounts);
    }
  }

  processTopUsers(): void {
    const allUsers = Object.entries(this.analytics.topUsers);
    this.topUsersArray = allUsers
      .map(([email, logins]) => ({ email, name: this.getUserDisplayName(email), logins }))
      .sort((a, b) => b.logins - a.logins)
      .slice(0, 10); // Get top 10 users
  }

  getUserDisplayName(email: string): string {
    // Try to find the user's name from the login history
    const userLogin = this.analytics.loginHistory.find(login => login.email === email);
    if (userLogin && userLogin.name) {
      return userLogin.name;
    }
    
    // Fallback to email prefix if no name is found
    return email.split('@')[0] || email;
  }

  getLoginsForPeriod(period: 'today' | 'week' | 'month' | 'year'): number {
    const now = new Date();
    const userLogins = this.analytics.loginHistory.filter(
      event => event.email === this.USER_EMAIL
    );

    return userLogins.filter(event => {
      const eventDate = new Date(event.timestamp);
      switch (period) {
        case 'today':
          return eventDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return eventDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return eventDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return eventDate >= yearAgo;
        default:
          return false;
      }
    }).length;
  }

  getDeviceType(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  getBrowserType(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  getDeviceInfo(userAgent: string): string {
    const device = this.getDeviceType(userAgent);
    const browser = this.getBrowserType(userAgent);
    return `${device} - ${browser}`;
  }

  getMostUsed(counts: { [key: string]: number }): string {
    const entries = Object.entries(counts);
    if (entries.length === 0) return 'Unknown';
    
    return entries.reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Format the date for display
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    // Return relative time for recent events, full date/time for older events
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${timeStr}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return `${dateStr} at ${timeStr}`;
    }
  }

  refresh(): void {
    this.loadAnalytics();
  }
}
