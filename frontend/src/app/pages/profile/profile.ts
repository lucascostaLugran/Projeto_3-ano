import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  user: any = null;
  userId = '';

  // campos editáveis
  email = '';
  password = '';
  birthDate = '';
  currentPassword = '';

  message = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || '';

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
          this.user = res;

          // pré-preencher campos
          this.email = res.email;
          this.birthDate = res.birthDate?.substring(0, 10);
        },
        error: () => {
          this.error = 'Erro ao carregar perfil';
        }
      });
  }

  updateProfile() {
    this.message = '';
    this.error = '';

    const body: any = {
      userId: this.userId,
      currentPassword: this.currentPassword
    };

    if (this.email) body.email = this.email;
    if (this.password) body.password = this.password;
    if (this.birthDate) body.birthDate = this.birthDate;

    this.http.put('http://localhost:3000/auth/profile', body)
      .subscribe({
        next: (res: any) => {
          this.message = res.message;
          this.password = '';
          this.currentPassword = '';
          this.loadProfile();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erro ao atualizar perfil';
        }
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}