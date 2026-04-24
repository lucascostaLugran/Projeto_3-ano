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
  styleUrls: ['./profile.css'] // 🔥 CORREÇÃO IMPORTANTE
  
})
export class Profile {

  user: any = null;
  userId = '';

  // campos editáveis
  email = '';
  password = '';
  birthDate = '';
  currentPassword = '';
  description = '';

  message = '';
  error = '';

  // 🔥 avatar
  selectedFile: any = null;
  previewUrl: any = null;
  

  constructor(private http: HttpClient, private router: Router) {}

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
          this.user = res;

          this.email = res.email;
          this.birthDate = res.birthDate?.substring(0, 10);
          this.description = res.description || '';

          // 🔥 carregar avatar existente
          this.previewUrl = res.avatar || null;
        },
        error: () => {
          this.error = 'Erro ao carregar perfil';
        }
      });
  }

  // 🔥 selecionar imagem + preview
  onFileSelected(event: any) {
    const file = event.target.files[0];
  
    if (!file) return;
  
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  
    // 🔥 validar tamanho
    if (file.size > MAX_SIZE) {
      this.error = 'Imagem demasiado grande (máx: 2MB)';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }
  
    // 🔥 limpar erro anterior
    this.error = '';
  
    this.selectedFile = file;
  
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
  
    reader.readAsDataURL(file);
  
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
    body.description = this.description;

    // 🔥 enviar avatar (base64)
    if (this.previewUrl) {
      body.avatar = this.previewUrl;
    }

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

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}