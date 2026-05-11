import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-detail.html',
  styleUrls: ['./list-detail.css']
})
export class ListDetail implements OnInit {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  list: any = null;

  token = '';

  message = '';
  messageType = 'neutral';

  sortBy = 'addedAt';
  order = 'desc';

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || '';
    }

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadList(id);
  }

  loadList(id: string) {
    this.http.get(`http://localhost:3000/auth/lists/${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (res: any) => {
        this.list = res;

        if (!this.list?.albums) {
          this.list.albums = [];
        }

        this.sortAlbums();
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Erro ao carregar lista';
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  sortAlbums() {
    if (!this.list?.albums) return;

    this.list.albums.sort((a: any, b: any) => {

      if (this.sortBy === 'title') {
        return this.order === 'asc'
          ? (a.title || '').localeCompare(b.title || '')
          : (b.title || '').localeCompare(a.title || '');
      }

      if (this.sortBy === 'artist') {
        return this.order === 'asc'
          ? (a.artist || '').localeCompare(b.artist || '')
          : (b.artist || '').localeCompare(a.artist || '');
      }

      const aDate = new Date(a.addedAt).getTime() || 0;
      const bDate = new Date(b.addedAt).getTime() || 0;

      return this.order === 'asc'
        ? aDate - bDate
        : bDate - aDate;
    });

    this.cdr.detectChanges();
  }

  changeSort(field: string) {
    if (this.sortBy === field) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.order = 'asc';
    }

    this.sortAlbums();
  }

  goToAlbum(id: string) {
    this.router.navigate(['/album', id]);
  }

  remove(albumId: string) {
    this.http.delete(
      `http://localhost:3000/auth/lists/${this.list._id}/${albumId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Álbum removido';
        this.messageType = 'neutral';

        this.list.albums = this.list.albums.filter(
          (a: any) => a.albumId !== albumId
        );

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => {
        this.message = 'Erro ao remover álbum';
        this.messageType = 'error';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      }
    });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}