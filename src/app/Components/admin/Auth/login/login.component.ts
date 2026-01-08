import { Component, OnInit } from '@angular/core'; // Thêm OnInit
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // Thêm ActivatedRoute
import { AuthService } from '../../../../../Services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  private returnUrl: string; // Biến để lưu lại URL muốn vào
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response && response.token) {
          // Gọi hàm saveToken của service
          this.authService.saveToken(response.token);
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = 'Đã xảy ra lỗi, không nhận được token.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}