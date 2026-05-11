import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  user: any = {
    username: ''
  };

  searchTerm = '';
  searchType: 'artist' | 'album' = 'artist';
  artists: any[] = [];
  albums: any[] = [];
  searchSubject = new Subject<string>();

  message = '';
  error = '';

  token: string = '';

  notifications: any[] = [];

  isNotifOpen = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || '';
    }

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
    this.loadNotifications();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.search();
    });
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }

  loadProfile() {
    this.http.get('http://localhost:3000/auth/profile', {
      headers: this.getAuthHeaders()
    })
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
    this.message = '';
    this.error = '';

    this.http.post(
      `http://localhost:3000/artists/${artistId}/favorite`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    ).subscribe({
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
  goToArtist(id: string) {
    this.router.navigate(['/artist', id]);
  }
  goToAlbum(id: string) {
    this.router.navigate(['/album', id]);
  }

  loadNotifications() {

    this.http.get('http://localhost:3000/notifications', {
      headers: this.getAuthHeaders()
    })

      .subscribe({

        next: (res: any) => {
          this.notifications = res;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Erro ao carregar notificações:', err);
        }

      });
  }

  toggleNotifications() {

    this.isNotifOpen = !this.isNotifOpen;

    if (this.isNotifOpen) {

      this.notifications.forEach(n => {

        if (!n.read) {

          this.http.patch(
            `http://localhost:3000/notifications/${n._id}/read`,
            {},
            {
              headers: this.getAuthHeaders()
            }
          ).subscribe();

          n.read = true;
        }

      });

    }

    this.cdr.detectChanges();
  }

  deleteNotification(id: string) {

    this.http.delete(
      `http://localhost:3000/notifications/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    )

      .subscribe({

        next: () => {

          this.notifications =
            this.notifications.filter(n => n._id !== id);

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Erro ao remover notificação:', err);
        }

      });
  }

  clearNotifications() {

    this.http.delete(
      `http://localhost:3000/notifications`,
      {
        headers: this.getAuthHeaders()
      }
    )

      .subscribe({

        next: () => {

          this.notifications = [];
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Erro ao limpar notificações:', err);
        }

      });
  }

  getUnreadCount(): number {

    return this.notifications.filter(n => !n.read).length;
  }

  goToNotificationAlbum(notification: any) {

    const albumId = notification.request?.album?._id;

    if (albumId) {

      this.isNotifOpen = false;

      this.router.navigate(['/album', albumId]);
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}