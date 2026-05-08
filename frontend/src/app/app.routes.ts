import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';
import { ArtistProfile } from './pages/artist-profile/artist-profile';
import { AlbumProfile } from './pages/album-profile/album-profile';
import { Collection } from './pages/collection/collection';
import { Requests} from './pages/request/request';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: 'request', component: Requests },
  { path: 'artist/:id', component: ArtistProfile },
  { path: 'album/:id', component: AlbumProfile }, 
  { path: 'collection', component: Collection }, 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } 
];