import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent {
  registerForm: FormGroup;
  private router = inject(Router);
  private authService = inject(AuthService);
  errorMessage: any;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group(
      {
        username: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        role: [
          "",
          [Validators.required, Validators.pattern(/^(Admin|Manager|Member)$/)],
        ],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get("password")?.value === form.get("confirmPassword")?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { confirmPassword, ...formData } = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: () => {
          this.router.navigate(['/login']); // Redirect to login page after success
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
