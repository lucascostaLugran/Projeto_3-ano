import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './request.html',
  styleUrls: ['./request.css']
})
export class Requests implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: any = { username: '' };
  requests: any[] = [];
  filteredRequests: any[] = [];
  selectedStatus: string = '';
  message = '';
  token = '';

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || '';
    }

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.loadRequests();
  }

  loadUserProfile() {
    this.http.get('http://localhost:3000/auth/profile', {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (res: any) => {
        this.user = res;
        this.cdr.detectChanges();
      }
    });
  }

  loadRequests() {
    this.http.get('http://localhost:3000/requests', {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (res: any) => {
        this.requests = res;
        this.filteredRequests = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar pedidos:', err)
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    if (!status) {
      this.filteredRequests = this.requests;
    } else {
      this.filteredRequests = this.requests.filter(r => r.status === status);
    }
    this.cdr.detectChanges();
  }

  goToAlbum(request: any) {
    const albumId = request.album?._id;
    if (albumId) {
      this.router.navigate(['/album', albumId]);
    }
  }

  getStatusLabel(status: string): string {
    if (status === 'aceite') return '✅ Aceite';
    if (status === 'recusado') return '❌ Recusado';
    return '🕐 Em análise';
  }

  getFormatIcon(format: string): string {
    if (format === 'CD') return '💿';
    if (format === 'Vinyl') return '📀';
    return '📼';
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}