import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Auth Guard/auth.interceptor';

import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // 2. Thêm tùy chọn này vào
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Luôn cuộn lên đầu trang mới
        anchorScrolling: 'enabled',          // Cho phép cuộn đến anchor (nếu có)
      })
    ),
    provideBrowserGlobalErrorListeners(),
   
  
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideToastr({      // Cấu hình cho toastr
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    
  ]
};
