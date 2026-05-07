import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: any = { username: '' };
  notifications: any[] = [];
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
    this.loadNotifications();
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

  loadNotifications() {
    this.http.get('http://localhost:3000/notifications', {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (res: any) => {
        this.notifications = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  markAsRead(id: string) {
    this.http.patch(`http://localhost:3000/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n._id === id);
        if (notif) notif.read = true;
        this.cdr.detectChanges();
      }
    });
  }

  goToAlbum(notification: any) {
    this.markAsRead(notification._id);
    const albumId = notification.request?.album;
    if (albumId) {
      this.router.navigate(['/album', albumId]);
    }
  }

  isAccepted(notification: any): boolean {
    return notification.request?.status === 'aceite';
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}