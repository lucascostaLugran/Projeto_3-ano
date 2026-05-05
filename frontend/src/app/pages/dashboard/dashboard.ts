import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  user: any = {
    username: ''
  };

  userId = '';

  searchTerm = '';
  searchType: 'artist' | 'album' = 'artist';
  artists: any[] = [];
  albums: any[] = [];
  searchSubject = new Subject<string>();

  message = '';
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId') || '';
    }

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.search();
    });
  }

  loadProfile() {
    this.http.get(`http://localhost:3000/auth/profile?userId=${this.userId}`)
      .subscribe({
        next: (res: any) => {
          this.user = { ...res };
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Erro ao carregar o perfil do utilizador.';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.error = '';
            this.cdr.detectChanges();
          }, 2000);
        }
      });
  }

  addFavorite(artistId: string) {
    this.http.post(`http://localhost:3000/artists/${artistId}/favorite`, {
      userId: this.userId
    }).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Atualizado com sucesso';
        this.cdr.detectChanges();

        this.loadProfile();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erro ao definir favorito';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 2000);
      }
    });
  }

  search() {
    this.error = '';
    this.message = '';

    const term = this.searchTerm.trim();

    if (!term) {
      this.artists = [];
      this.albums = [];
      this.error = `Introduza um nome de ${this.searchType === 'artist' ? 'artista' : 'álbum'}.`;
      this.cdr.detectChanges();
      return;
    }

    if (this.searchType === 'artist') {
      this.http.get(`http://localhost:3000/artists/search?name=${term}`)
        .subscribe({
          next: (res: any) => {
            this.artists = res;
            this.albums = [];
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.artists = [];
            this.error = err.error?.message || 'Nenhum artista encontrado.';
            this.cdr.detectChanges();
          }
        });
    } else {
      this.http.get(`http://localhost:3000/albums/search?title=${term}`)
        .subscribe({
          next: (res: any) => {
            this.albums = res;
            this.artists = []; 
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.albums = [];
            this.error = err.error?.message || 'Nenhum álbum encontrado.';
            this.cdr.detectChanges();
          }
        });
    }
  }
  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/login']);
  }
}