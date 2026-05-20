  import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Router, RouterModule } from '@angular/router';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';

  @Component({
    selector: 'app-collection',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './collection.html',
    styleUrls: ['./collection.css'],
  })
  export class Collection implements OnInit {

    user: any = { username: '' };
    collection: any[] = [];

    message = '';
    error = '';
    sortField: string = 'addedAt';
    sortDirection: 'asc' | 'desc' = 'desc';

    token: string = '';

    constructor(
      private http: HttpClient,
      private router: Router,
      private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('token') || '';
      }

      if (!this.token) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadProfile();
      this.loadCollection();
    }

    getAuthHeaders() {
      return {
        Authorization: `Bearer ${this.token}`
      };
    }

    loadProfile() {
      this.http.get('http://localhost:3000/auth/profile', {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (res: any) => {
          this.user = res;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Erro ao carregar perfil';
          this.cdr.detectChanges();
        }
      });
    }

    loadCollection() {
      this.http.get('http://localhost:3000/albums/collection', {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (res: any) => {
          this.collection = res;
    
          this.loadImages();  
    
          this.sortCollection();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erro ao carregar coleção';
          this.cdr.detectChanges();
        }
      });
    }

    loadImages() {
      this.collection.forEach(item => {
        this.http.get(`http://localhost:3000/albums/${item.albumId || item._id}`)
          .subscribe((album: any) => {
            item.imageUrl = album.imageUrl;
            this.cdr.detectChanges();
          });
      });
    }

    goToAlbum(id: string) {
      this.router.navigate(['/album', id]);
    }

    goToArtist(artistId: string) {
      this.router.navigate(['/artist', artistId]);
    }

    sortCollection() {
      const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((o, i) => o?.[i], obj);
      };

      this.collection.sort((a, b) => {
        let valA = getValue(a, this.sortField);
        let valB = getValue(b, this.sortField);

        if (this.sortField === 'addedAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      this.cdr.detectChanges();
    }

    toggleSort() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortCollection();
    }

    removeFromCollection(item: any) {
      this.message = '';
      this.error = '';

      this.http.delete('http://localhost:3000/auth/collection', {
        headers: this.getAuthHeaders(),
        body: {
          albumId: item.albumId,
          ean13: item.ean13
        }
      }).subscribe({
        next: (res: any) => {
          this.message = res.message || 'Removido com sucesso';

          this.collection = this.collection.filter(
            i => !(i.albumId === item.albumId && i.ean13 === item.ean13)
          );

          this.cdr.detectChanges();

          setTimeout(() => {
            this.message = '';
            this.cdr.detectChanges();
          }, 4000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Erro ao remover';

          this.cdr.detectChanges();

          setTimeout(() => {
            this.error = '';
            this.cdr.detectChanges();
          }, 4000);
        }
      });
    }

    logout() {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }