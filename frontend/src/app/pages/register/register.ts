import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  username = '';
  email = '';
  password = '';
  birthDate = '';

  showPassword = false;

  message = '';
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  onRegister() {
    this.message = '';
    this.error = '';

    const body = {
      username: this.username,
      email: this.email,
      password: this.password,
      birthDate: this.birthDate
    };

    this.http.post('http://localhost:3000/auth/register', body)
      .subscribe({
        next: (res: any) => {

          // guardar mensagem para login
          localStorage.setItem("successMessage", "Conta criada com sucesso!");

          this.router.navigate(['/login']);
        },
        error: (err: any) => {

          console.log("ERRO COMPLETO:", err);
          console.log("BODY:", err.error);
          console.log("MESSAGE:", err.error?.message);

          this.error =
            err.error?.message ||
            err.error ||
            err.message ||
            'Erro no registo';

          this.cdr.detectChanges();
        }
      });
  }
}