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
  styleUrl: './artist-profile.css',
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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
  

    if (!id) return;

    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId') || '';
    }

    this.http.get(`http://localhost:3000/artists/${id}`)
      .subscribe({
        next: (res: any) => {
          this.artist = res.artist;
          this.albums = res.albums;
          console.log("TOTAL REAL:", this.albums.length);

          this.cdr.detectChanges();

          if (this.userId) {
            this.http.get(`http://localhost:3000/auth/profile?userId=${this.userId}`)
              .subscribe((res: any) => {
                this.user = { ...res };
                this.cdr.detectChanges();
              });
          }
        },
        error: () => {
          console.error("Erro ao carregar artista");
        }
      });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  }

  toggleFavorite() {
    if (!this.userId || !this.artist) return;

    this.http.post(`http://localhost:3000/artists/${this.artist._id}/favorite`, {
      userId: this.userId
    }).subscribe({
      next: (res: any) => {
        this.isFavorite = !this.isFavorite;

        this.message = res.message || 'Atualizado com sucesso';
        this.messageType = 'neutral';

        this.cdr.detectChanges(); 

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges(); 
        }, 2000);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Erro ao atualizar favorito';
        this.messageType = 'error';

        this.cdr.detectChanges(); 

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges(); 
        }, 2000);
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