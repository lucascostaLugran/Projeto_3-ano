import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  user: any = null;
  userId = '';

  searchTerm = '';
  artists: any[] = [];

  message = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || '';

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile() {
    this.http.get(`http://localhost:3000/auth/profile?userId=${this.userId}`)
      .subscribe({
        next: (res: any) => {
          this.user = res;
        },
        error: () => {
          this.error = 'Erro ao carregar o perfil do utilizador.';
        }
      });
  }

  addFavorite(artistId: string) {
    this.http.post(`http://localhost:3000/artists/${artistId}/favorite`, {
      userId: this.userId
    }).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.loadProfile();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erro ao definir favorito';
      }
    });
  }

  // 🔥 BOTÃO NORMAL (continua a funcionar)
  search() {
    this.error = '';
    this.message = '';

    if (!this.searchTerm.trim()) {
      this.error = 'Introduza um nome de artista.';
      return;
    }

    this.http.get(`http://localhost:3000/artists/search?name=${this.searchTerm}`)
      .subscribe({
        next: (res: any) => {
          this.artists = res;
        },
        error: (err: any) => {
          this.artists = [];
          this.error = err.error?.message || 'Nenhum artista encontrado.';
        }
      });
  }

  // 🔥 SMART SEARCH (AUTO)
  onSearchChange() {
    this.error = '';

    if (this.searchTerm.length < 2) {
      this.artists = [];
      return;
    }

    this.http.get(`http://localhost:3000/artists/search?name=${this.searchTerm}`)
      .subscribe({
        next: (res: any) => {
          this.artists = res;
        },
        error: () => {
          this.artists = [];
        }
      });
  }

  logout() {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}