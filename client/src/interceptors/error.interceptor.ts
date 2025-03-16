import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, retry, throwError } from "rxjs";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      retry(3), // Retry API request up to 3 times
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        return throwError(() => error); 
      })
    );
  }
}
