import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
 // Chỉnh lại đường dẫn nếu cần

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Cho phép truy cập
  } else {
    // Khi chưa đăng nhập, chuyển hướng đến trang login
    // VÀ gửi kèm URL muốn truy cập (state.url) qua queryParams
    router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};