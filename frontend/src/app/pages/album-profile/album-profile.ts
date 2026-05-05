import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-album-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './album-profile.html',
  styleUrl: './album-profile.css'
})
export class AlbumProfile implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  album: any = null;
  userId: string = '';
  user: any = { username: '' };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId') || '';
    }

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();

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
    this.http.get(`http://localhost:3000/auth/profile?userId=${this.userId}`)
      .subscribe({
        next: (res: any) => {
          this.user = res;
          this.cdr.detectChanges();
        }
      });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/login']);
  }
}