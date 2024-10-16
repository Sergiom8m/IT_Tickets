import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'incidences',
    loadChildren: () => import('./pages/incidences/incidences.module').then( m => m.IncidencesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./pages/vehicles/vehicles.module').then( m => m.VehiclesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'reservation',
    loadChildren: () => import('./pages/reservation/reservation.module').then( m => m.ReservationPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
