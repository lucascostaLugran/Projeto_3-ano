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

  user: any = {
    username: ''
  };

  isEditing = false;

  editData: any = {
    username: '',
    email: '',
    birthDate: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  showCurrentPassword = false;

  error = '';
  message = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile() {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    this.http.get(`http://localhost:3000/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .subscribe({
      next: (res: any) => {
        this.user = { ...res };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log("PROFILE ERROR:", err);

        this.error = 'Erro ao carregar perfil';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 2000);
      }
    });
  }

  openEdit() {
    this.editData = {
      username: this.user.username || '',
      email: this.user.email || '',
      birthDate: this.user.birthDate?.substring(0, 10) || '',
      currentPassword: '',
      password: '',
      confirmPassword: ''
    };

    this.isEditing = true;
  }

  updateProfile() {

    this.error = '';
    this.message = '';

    if (this.editData.password || this.editData.confirmPassword) {

      if (!this.editData.currentPassword) {
        this.error = "Tens de inserir a password atual";
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 2000);

        return;
      }

      if (this.editData.password !== this.editData.confirmPassword) {
        this.error = "As passwords não coincidem";
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 2000);

        return;
      }
    }

    if (this.editData.birthDate) {
      const today = new Date();
      const birth = new Date(this.editData.birthDate);

      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age < 13) {
        this.error = "Tens de ter pelo menos 13 anos";
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 2000);

        return;
      }
    }

    const body: any = {};

    if (this.editData.username) body.username = this.editData.username;
    if (this.editData.email) body.email = this.editData.email;
    if (this.editData.birthDate) body.birthDate = this.editData.birthDate;
    if (this.editData.password) body.password = this.editData.password;
    if (this.editData.currentPassword) body.currentPassword = this.editData.currentPassword;

    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    this.http.put('http://localhost:3000/auth/profile', body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .subscribe({
      next: () => {
        this.message = 'Perfil atualizado com sucesso';
        this.isEditing = false;
        this.cdr.detectChanges();

        this.loadProfile();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erro ao atualizar perfil';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 2000);
      }
    });
  }

  removeFavorite() {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    this.http.delete('http://localhost:3000/artists/favorite', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.user.favoriteArtist = null;
        this.message = 'Artista removido dos favoritos';
        this.isEditing = false;

        this.cdr.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao remover artista favorito';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}