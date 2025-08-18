import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { trigger, transition, style, animate, query, group, state } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('routeAnimations', [
      // Home page transitions (fade in from center)
      transition('* => home', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'scale(0.95) translateY(20px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('500ms ease-out', style({
            opacity: 1,
            transform: 'scale(1) translateY(0)'
          }))
        ], { optional: true })
      ]),
      
      // About page transitions (slide from right)
      transition('* => about', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateX(50px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('400ms ease-out', style({
            opacity: 1,
            transform: 'translateX(0)'
          }))
        ], { optional: true })
      ]),
      
      // Projects page transitions (slide from left)
      transition('* => projects', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateX(-50px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('400ms ease-out', style({
            opacity: 1,
            transform: 'translateX(0)'
          }))
        ], { optional: true })
      ]),
      
      // Contact page transitions (fade up)
      transition('* => contact', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(30px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('450ms ease-out', style({
            opacity: 1,
            transform: 'translateY(0)'
          }))
        ], { optional: true })
      ]),
      
      // Dashboard transitions (zoom in)
      transition('* => dashboard', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'scale(0.9)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('600ms ease-out', style({
            opacity: 1,
            transform: 'scale(1)'
          }))
        ], { optional: true })
      ]),
      
      // Chatbot transitions (slide up)
      transition('* => chatbot', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(40px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('500ms ease-out', style({
            opacity: 1,
            transform: 'translateY(0)'
          }))
        ], { optional: true })
      ]),
      
      // Analytics transitions (fade in with slight rotation)
      transition('* => analytics', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'rotateY(5deg) translateY(20px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('550ms ease-out', style({
            opacity: 1,
            transform: 'rotateY(0deg) translateY(0)'
          }))
        ], { optional: true })
      ]),
      
      // Default transition for any other route changes
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: 0,
            transform: 'translateY(20px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('400ms ease-out', style({
            opacity: 1,
            transform: 'translateY(0)'
          }))
        ], { optional: true }),
        query(':leave', [
          animate('300ms ease-in', style({
            opacity: 0,
            transform: 'translateY(-20px)'
          }))
        ], { optional: true })
      ])
    ]),
    
    // Loading indicator animation
    trigger('loadingAnimation', [
      state('loading', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      state('loaded', style({
        opacity: 0,
        transform: 'translateY(-100%)'
      })),
      transition('loading => loaded', [
        animate('300ms ease-out')
      ]),
      transition('loaded => loading', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class AppComponent {
  title = 'portfolio-site';
  isLoading = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => 
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else {
        this.isLoading = false;
      }
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
