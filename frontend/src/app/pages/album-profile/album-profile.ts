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

  lists: any[] = [];
  selectedListId = '';

  allVersions = [
    { format: "CD", description: "Standard" },
    { format: "CD", description: "Deluxe" },
    { format: "CD", description: "Deluxe Edition" },
    { format: "CD", description: "Remastered" },
    { format: "CD", description: "Anniversary Edition" },
    { format: "CD", description: "Collector's Edition" },
    { format: "CD", description: "Expanded Edition" },
    { format: "CD", description: "Japanese Edition" },
    { format: "Vinyl", description: "180g" },
    { format: "Vinyl", description: "180g Deluxe" },
    { format: "Vinyl", description: "Colored Vinyl" },
    { format: "Vinyl", description: "Transparent Vinyl" },
    { format: "Vinyl", description: "Picture Disc" },
    { format: "Vinyl", description: "Gatefold Edition" },
    { format: "Vinyl", description: "Deluxe Edition" },
    { format: "Vinyl", description: "Remastered" },
    { format: "Vinyl", description: "Limited Edition" },
    { format: "Vinyl", description: "Anniversary Edition" },
    { format: "Cassette", description: "Standard" },
    { format: "Cassette", description: "Limited Edition" },
    { format: "Cassette", description: "Collector's Edition" },
    { format: "Cassette", description: "Colored Cassette" },
    { format: "Cassette", description: "Anniversary Edition" }
  ];

  get filteredDescriptions() {
    return this.allVersions.filter(
      v => v.format === this.requestData.format
    );
  }

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
    this.loadLists();

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

  loadLists() {
    this.http.get('http://localhost:3000/auth/lists', {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (res: any) => {
        console.log(res); 
        this.lists = res;
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
        }, 4000);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Erro ao adicionar';
        this.messageType = 'error';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      }
    });
  }

  addToList() {
    if (!this.selectedListId || !this.album) return;
  
    this.http.post(
      `http://localhost:3000/auth/lists/${this.selectedListId}/add-album`,
      { albumId: this.album._id },
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Adicionado à lista';
        this.messageType = 'neutral';
  
        this.loadLists();
  
        this.cdr.detectChanges();
  
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Erro ao adicionar à lista';
        this.messageType = 'error';
  
        this.cdr.detectChanges();
  
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
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
      setTimeout(() => { this.requestError = ''; this.cdr.detectChanges(); }, 4000);
      return;
    }

    if (!/^\d{13}$/.test(this.requestData.ean13)) {
      this.requestError = 'EAN-13 deve ter exatamente 13 dígitos';
      this.cdr.detectChanges();
      setTimeout(() => { this.requestError = ''; this.cdr.detectChanges(); }, 4000);
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
        }, 4000);
      },
      error: (err: any) => {
        this.requestError = err.error?.message || 'Erro ao submeter pedido';
        this.cdr.detectChanges();
        setTimeout(() => { this.requestError = ''; this.cdr.detectChanges(); }, 2000);
      }
    });
  }
  isInSelectedList(): boolean {
    if (!this.selectedListId || !this.album) return false;
  
    const list = this.lists.find(l => l._id === this.selectedListId);
    if (!list) return false;
  
    return list.albums?.some((a: any) =>
      a.album === this.album._id || a.album?._id === this.album._id
    );
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}