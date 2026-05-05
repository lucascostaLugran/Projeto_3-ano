import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  showPassword = false;
  message = '';
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {

    if (typeof window !== 'undefined') {
      const msg = localStorage.getItem("successMessage");

      if (msg) {
        this.message = msg;
        localStorage.removeItem("successMessage");
      }
    }
  }

  onLogin() {
    this.error = '';
    console.log("USERNAME:", this.username);
    console.log("PASSWORD:", this.password);


    this.http.post('http://localhost:3000/auth/login', {
      username: this.username,
      password: this.password
    })
    .subscribe({
      next: (res: any) => {

          localStorage.setItem('token', res.token);


          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 0);
      },
      error: (err: any) => {

        console.log("LOGIN ERROR:", err);

        this.error =
          err.error?.message ||
          err.error ||
          err.message ||
          'Erro no login';

        this.cdr.detectChanges();
      }
    });
  }
}