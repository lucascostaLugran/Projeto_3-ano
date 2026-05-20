import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lists.html',
  styleUrls: ['./lists.css']
})
export class Lists implements OnInit {

  lists: any[] = [];
  newListName = '';
  message = '';
  error = '';

  sortBy = 'updatedAt';
  order = 'desc';

  token: string = '';

  user: any = {
    username: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || '';
    }

    if (!this.token) {
      this.router.navigate(['/login']);
    } else {
      this.loadProfile();
      this.loadLists();
    }
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }

  loadProfile() {
    if (!this.token) return;

    this.http.get('http://localhost:3000/auth/profile', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (res: any) => {
        this.user = res;
        this.cdr.detectChanges();
      }
    });
  }

  loadLists() {
    if (!this.token) return;

    this.http.get(
      `http://localhost:3000/auth/lists?sortBy=${this.sortBy}&order=${this.order}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res: any) => {
        this.lists = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar listas';
        this.cdr.detectChanges();
      }
    });
  }

  createList() {
    if (!this.token) return;

    this.message = '';
    this.error = '';

    if (!this.newListName.trim()) return;

    this.http.post(
      `http://localhost:3000/auth/lists`,
      { name: this.newListName },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.newListName = '';
        this.loadLists();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erro ao criar lista';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 4000);
      }
    });
  }

  deleteList(id: string, event: Event) {
    event.stopPropagation();

    if (!this.token) return;

    this.http.delete(
      `http://localhost:3000/auth/lists/${id}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.loadLists();

        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: () => {
        this.error = 'Erro ao remover lista';

        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
        }, 4000);
      }
    });
  }

  changeSort(field: string) {
    if (this.sortBy === field) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.order = 'asc';
    }

    this.loadLists();
  }

  goToList(id: string) {
    this.router.navigate(['/lists', id]);
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}