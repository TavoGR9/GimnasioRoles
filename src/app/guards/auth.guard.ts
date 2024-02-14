import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  
  const auth = inject(AuthService);
  const router = inject(Router);
  const currentUser = auth.getCurrentUser();
/*
  if (!auth.isLoggedInBS()) {
    router.navigate(['/login']);
  }
*/
  if(!JSON.stringify(currentUser)){
    router.navigate(['/login']);
  }

  return true;
};