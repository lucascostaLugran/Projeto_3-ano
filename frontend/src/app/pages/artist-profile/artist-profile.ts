import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-artist-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './artist-profile.html',
  styleUrls: ['./artist-profile.css'],
})
export class ArtistProfile implements OnInit {

  artist: any = null;
  albums: any[] = [];
  isFavorite = false;
  userId = '';
  message = '';
  messageType = 'neutral';
  showAll = false;

  user: any = {
    username: ''
  };

  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || '';
    }

    if (!id) return;

    this.http.get(`http://localhost:3000/artists/${id}`)
      .subscribe({
        next: (res: any) => {
          this.artist = res.artist;
          this.albums = res.albums;

          if (this.token) {
            this.http.get(`http://localhost:3000/auth/profile`, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            }).subscribe((res: any) => {
              this.user = res;
              if (this.user.favoriteArtist && this.artist) {
                this.isFavorite =
                  this.user.favoriteArtist._id === this.artist._id;
              }

              this.cdr.detectChanges();
            });
          }
        }
      });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  toggleFavorite() {
    if (!this.token || !this.artist) return;

    this.http.post(
      `http://localhost:3000/artists/${this.artist._id}/favorite`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: (res: any) => {
        this.isFavorite = true;

        this.message = res.message || 'Atualizado com sucesso';
        this.messageType = 'neutral';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Erro ao atualizar favorito';
        this.messageType = 'error';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      }
    });
  }

  get visibleAlbums() {
    return this.showAll ? this.albums : this.albums.slice(0, 3);
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
  }
}