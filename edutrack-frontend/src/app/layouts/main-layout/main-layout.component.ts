import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="h-screen flex flex-col font-sans text-slate-900 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.10),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fafc_44%,#eef2f7_100%)]">
      <app-navbar></app-navbar>

      <main class="flex-1 relative pt-[76px] overflow-y-auto scrollbar-hide">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-white/90 backdrop-blur border-t border-slate-100 py-2 flex-none">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            &copy; 2026 EduTrack
          </p>
          <span class="text-edutrack-primary text-[10px] font-black uppercase tracking-widest">Projet Angular</span>
        </div>
      </footer>
    </div>
  `,
})
export class MainLayoutComponent {}
