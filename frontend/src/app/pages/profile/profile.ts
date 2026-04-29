import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {

  user: any = null;
  userId = '';

  isEditing = false;

  editData: any = {
    username: '',
    email: '',
    birthDate: '',
    password: ''
  };

  showPassword = false;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId') || '';
    }

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile() {
    this.http.get(`http://localhost:3000/auth/profile?userId=${this.userId}`)
      .subscribe({
        next: (res: any) => {
          this.user = { ...res };
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Erro ao carregar perfil';
        }
      });
  }

  // 🔥 ABRIR MODAL COM DADOS ATUAIS
  openEdit() {
    this.editData = {
      username: this.user?.username || '',
      email: this.user?.email || '',
      birthDate: this.user?.birthDate?.substring(0, 10) || '',
      password: ''
    };

    this.isEditing = true;
  }

  // 🔥 ATUALIZAR PERFIL
  updateProfile() {

    const body: any = {
      userId: this.userId
    };

    if (this.editData.username) body.username = this.editData.username;
    if (this.editData.email) body.email = this.editData.email;
    if (this.editData.birthDate) body.birthDate = this.editData.birthDate;
    if (this.editData.password) body.password = this.editData.password;

    this.http.put('http://localhost:3000/auth/profile', body)
      .subscribe({
        next: () => {
          this.isEditing = false;
          this.loadProfile(); // refresh UI
        },
        error: () => {
          this.error = 'Erro ao atualizar perfil';
        }
      });
  }

  removeFavorite() {
  this.http.delete('http://localhost:3000/auth/favorite', {
    body: { userId: this.userId }
  }).subscribe({
    next: (res: any) => {

      this.user.favoriteArtist = null;

      this.cdr.detectChanges();

      this.isEditing = false;

      // opcional (se quiseres garantir sync com backend)
      // this.loadProfile();

      console.log(res.message); // "Favorito removido"
    },
    error: (err) => {
      console.log(err);
      this.error = err.error?.message || 'Erro ao remover artista favorito';
    }
  });
}

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}