import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-album-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './album-profile.html',
  styleUrls: ['./album-profile.css']
})
export class AlbumProfile implements OnInit {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  album: any = null;
  user: any = { username: '' };

  collection: any[] = [];

  message = '';
  messageType = 'neutral';

  token: string = '';
  isRequestModalOpen = false;
  requestMessage = '';
  requestError = '';

  requestData = {
    ean13: '',
    format: '',
    description: ''
  };


  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || '';
    }

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.loadCollection();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.http.get(`http://localhost:3000/albums/${id}`).subscribe({
        next: (res) => {
          this.album = res;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar álbum:', err)
      });
    }
  }

  loadUserProfile() {
    this.http.get(`http://localhost:3000/auth/profile`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (res: any) => {
        this.user = res;
        this.cdr.detectChanges();
      }
    });
  }

  loadCollection() {
    this.http.get('http://localhost:3000/albums/collection', {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (res: any) => {
        this.collection = res;
        this.cdr.detectChanges();
      }
    });
  }


  isInCollection(ean13: string): boolean {
    return this.collection.some(item => item.ean13 === ean13);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  addToCollection(ean13: string) {
    if (!this.token || !this.album) return;

    this.http.post(
      'http://localhost:3000/albums/collection',
      {
        albumId: this.album._id,
        ean13: ean13
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Adicionado à coleção!';
        this.messageType = 'neutral';

        this.loadCollection();

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Erro ao adicionar';
        this.messageType = 'error';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      }
    });
  }

  openRequestModal() {
    this.requestData = { ean13: '', format: '', description: '' };
    this.requestMessage = '';
    this.requestError = '';
    this.isRequestModalOpen = true;
  }

  submitRequest() {
    if (!this.requestData.ean13 || !this.requestData.format) {
      this.requestError = 'EAN-13 e formato são obrigatórios';
      this.cdr.detectChanges();
      setTimeout(() => { this.requestError = ''; this.cdr.detectChanges(); }, 2000);
      return;
    }

    if (!/^\d{13}$/.test(this.requestData.ean13)) {
      this.requestError = 'EAN-13 deve ter exatamente 13 dígitos';
      this.cdr.detectChanges();
      setTimeout(() => { this.requestError = ''; this.cdr.detectChanges(); }, 2000);
      return;
    }

    this.http.post(
      'http://localhost:3000/requests',
      {
        albumId: this.album._id,
        ean13: this.requestData.ean13,
        format: this.requestData.format,
        description: this.requestData.description
      },
      { headers: { Authorization: `Bearer ${this.token}` } }
    ).subscribe({
      next: (res: any) => {
        this.requestMessage = 'Pedido submetido com sucesso!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.isRequestModalOpen = false;
          this.requestMessage = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err: any) => {
        this.requestError = err.error?.message || 'Erro ao submeter pedido';
        this.cdr.detectChanges();
        setTimeout(() => { this.requestError = ''; this.cdr.detectChanges(); }, 2000);
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

